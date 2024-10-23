import { callReadOnlyFunction, cvToJSON, principalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

// Initialize the mainnet network
const network = new StacksMainnet();

// Contract details
const contractAddress = 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N';
const contractName = 'pool-0-reserve-v1-2';

// Function to get the list of assets
async function getAssets() {
  const functionName = 'get-assets';

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  };

  const result = await callReadOnlyFunction(options);
  return cvToJSON(result).value;
}

// Function to get the reserve state of an asset
async function getReserveState(asset) {
  const functionName = 'get-reserve-state';

  // Convert the asset string to a Clarity principal
  const assetPrincipal = principalCV(asset);

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [assetPrincipal],
    network,
    senderAddress: contractAddress,
  };

  const result = await callReadOnlyFunction(options);
  return cvToJSON(result).value;
}

// Main function to extract assets and their reserve state
async function extractAssetsAndReserveStates() {
  try {
    console.log("Getting Assets");
    // Fetch the list of assets
    const assets = await getAssets();
    console.log('Assets:', assets);

    // Iterate through the assets and fetch the reserve state for each one
    for (const asset of assets) {
      console.log(`Fetching reserve state for asset: ${asset.value}`);
      const reserveState = await getReserveState(asset.value);
      console.log(`Reserve state for ${asset.value}:`, reserveState);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
extractAssetsAndReserveStates();

