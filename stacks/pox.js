import axios from 'axios';
import { 
  deserializeCV
} from '@stacks/transactions';
import { c32address } from 'c32check'; // Import the c32address function from c32check
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

// API base URL for Stacks mainnet
const STACKS_API_URL = 'https://api.hiro.so';
const contractAddress = "SP000000000000000000002Q6VF78";
const contractName = "pox-4";
const sender = "SP3TRVBX53CN78AS8C3HNTM3GPNDHGA34F9M7MAH2";

// CSV Writer setup
const csvWriter = createObjectCsvWriter({
  path: './stackers.csv',
  header: [
    { id: 'index', title: 'Index' },
    { id: 'poxAddrHash', title: 'PoX Address Hash' },
    { id: 'poxAddrVersion', title: 'PoX Address Version' },
    { id: 'signer', title: 'Signer' },
    { id: 'ustx', title: 'Total uSTX' },
    { id: 'stackerAddress', title: 'Stacker Address' }
  ]
});

// Parse Clarity value from a hex string
function parseClarityValue(hexStr) {
  if (hexStr.startsWith('0x')) {
    hexStr = hexStr.slice(2);
  }

  const buffer = Buffer.from(hexStr, 'hex');
  return deserializeCV(buffer);
}

// Convert value to Clarity Hex
function generateHex(value) {
  const hexValue = value.toString(16);
  const paddedValue = hexValue.padStart(33, '0');
  const finalHex = '01' + paddedValue.slice(1);
  return '0x' + finalHex;
}

// Decode Clarity Hex to integer
function decodeHex(value) {
  if (value.startsWith('0x')) {
    value = value.slice(2);
  }

  if (value.startsWith('01')) {
    value = value.slice(2);
  }

  const strippedValue = value.replace(/^0+/, '');
  if (!strippedValue) return 0;

  return parseInt(strippedValue, 16);
}

// Function to get the number of stackers for a specific cycle
async function getNoStackers(value) {
  const functionName = 'get-reward-set-size';
  const url = `${STACKS_API_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

  const payload = {
    sender: sender,
    arguments: [generateHex(value)]
  };

  try {
    const response = await axios.post(url, payload);
    console.log(`Status Code: ${response.status}`);

    const result = response.data.result;
    const decodedResult = decodeHex(result);

    if (decodedResult) {
      console.log(`Number of stackers: ${decodedResult}`);
      return decodedResult;
    } else {
      console.log("No result found in response.");
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving number of stackers: ${error}`);
  }
}

// Function to get stacker info by cycle and index
async function getStackersByCycle(cycle, index) {
  const functionName = 'get-reward-set-pox-address';
  const url = `${STACKS_API_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

  const payload = {
    sender: sender,
    arguments: [generateHex(cycle), generateHex(index)]
  };

  try {
    const response = await axios.post(url, payload);

    const result = response.data.result;

    if (result) {
      const clarityValue = parseClarityValue(result);
      const clarityData = clarityValue.value.data;

      // Decoding pox-addr
      const poxAddr = clarityData['pox-addr'].data;
      const hashbytesHex = poxAddr.hashbytes.buffer.toString('hex');
      const versionHex = poxAddr.version.buffer.toString('hex');

      // Decoding signer
      const signer = clarityData['signer'];
      const signerHex = signer.buffer ? signer.buffer.toString('hex') : 'Signer is missing';

      // Decoding stacker
      const stacker = clarityData['stacker'];
      let stackerAddress = null;

      if (stacker.type === 10 && stacker.value.type === 5) {
        const address = stacker.value.address;
        const stackerVersion = address.version;
        const stackerHash160 = address.hash160;
        stackerAddress = c32address(stackerVersion, stackerHash160);
      }

      // Ensure Total uSTX is a number, not an object
      const totalUstx = clarityData['total-ustx'].value.toString(); // Convert to string to avoid [object Object]

      return {
        index: index,
        poxAddrHash: `0x${hashbytesHex}`,
        poxAddrVersion: `0x${versionHex}`,
        signer: `0x${signerHex}`,
        ustx: totalUstx,
        stackerAddress: stackerAddress
      };

    } else {
      console.log(`No result found for cycle ${cycle}, index ${index}.`);
      return null;
    }
  } catch (error) {
    console.error(`Error parsing response for cycle ${cycle}, index ${index}: ${error.message}`);
    return null;
  }
}

// Function to get total uSTX stacked for a cycle
async function getCycleData(cycle) {
  const functionName = 'get-total-ustx-stacked';
  const url = `${STACKS_API_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

  const payload = {
    sender: sender,
    arguments: [generateHex(cycle)]
  };

  try {
    const response = await axios.post(url, payload);
    console.log(`Status Code: ${response.status}`);
    console.log("Response Text:");
    console.log(response.data);

    const result = response.data.result;
    const decodedResult = decodeHex(result) / 1e6;

    if (decodedResult) {
      console.log(`Total uSTX stacked: ${decodedResult}`);
    } else {
      console.log("No result found in response.");
    }
  } catch (error) {
    console.error(`Error retrieving cycle data: ${error}`);
  }
}

// Main execution
(async function () {
  const cycle = 94;

  // Get total uSTX stacked for the cycle
  await getCycleData(cycle);

  // Get the number of stackers for the cycle
  const numberOfStackers = await getNoStackers(cycle);

  if (numberOfStackers !== null) {
    const stackersData = [];

    // Collect stacker data for each index
    for (let index = 0; index < numberOfStackers; index++) {
      const stackerInfo = await getStackersByCycle(cycle, index);
      if (stackerInfo) {
        stackersData.push(stackerInfo);
      }
    }

    // Write the data to CSV
    if (stackersData.length > 0) {
      await csvWriter.writeRecords(stackersData);
      console.log('CSV file successfully written.');
    } else {
      console.log('No stacker data found to write to CSV.');
    }
  }
})();
