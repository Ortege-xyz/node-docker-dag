import axios from 'axios';
import { 
  deserializeCV,
  intCV,
  uintCV,
  bufferCV,
  standardPrincipalCV,
  contractPrincipalCV,
  trueCV,
  falseCV,
  noneCV,
  someCV,
  responseOkCV,
  responseErrorCV,
  listCV,
  tupleCV 
} from '@stacks/transactions';

// API base URL for Stacks mainnet
const STACKS_API_URL = 'https://api.hiro.so';
const contractAddress = "SP000000000000000000002Q6VF78";
const contractName = "pox-4";
const sender = "SP3TRVBX53CN78AS8C3HNTM3GPNDHGA34F9M7MAH2";

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

// Function to handle BigInt in JSON serialization
function stringifyWithBigInt(obj) {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
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

async function getStackersByCycle(cycle, index) {
    const functionName = 'get-reward-set-pox-address';
    const url = `${STACKS_API_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;
  
    const payload = {
      sender: sender,
      arguments: [generateHex(cycle), generateHex(index)]
    };
  
    try {
      const response = await axios.post(url, payload);
      console.log(`Status Code: ${response.status}`);
      console.log(`Cycle ${cycle}, Index ${index} Response Text:`);
      console.log(response.data);
  
      const result = response.data.result;
  
      if (result) {
        const clarityValue = parseClarityValue(result);
        console.log("Clarity Value:", stringifyWithBigInt(clarityValue)); // Log the entire Clarity Value
  
        // Extract the signer and total-ustx from the Clarity value
        const clarityData = clarityValue.value.data;
        const totalUstx = clarityData.total_ustx ? clarityData.total_ustx.value : null;
        const signer = clarityData.signer ? clarityData.signer.buffer.data : null;
  
        if (totalUstx && signer) {
          console.log(
            `Stacker info (cycle ${cycle}, index ${index}):\n` +
            `- Signer: ${Buffer.from(signer).toString('hex')}\n` +
            `- Total uSTX: ${totalUstx}`
          );
        } else {
          console.error(`Missing signer or total-ustx data for cycle ${cycle}, index ${index}`);
        }
      } else {
        console.log(`No result found for cycle ${cycle}, index ${index}.`);
      }
    } catch (error) {
      console.error(`Error parsing response for cycle ${cycle}, index ${index}: ${error}`);
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

  // If the number of stackers is retrieved, get stacker info for each
  if (numberOfStackers !== null) {
    for (let index = 0; index < numberOfStackers; index++) {
      await getStackersByCycle(cycle, index);
    }
  }
})();
