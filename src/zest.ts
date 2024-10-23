import { callReadOnlyFunction, cvToJSON, principalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const network = new StacksMainnet();

// Doris environment variables
const dorisHost = process.env.DORIS_HOST || '';
const dorisPort = process.env.DORIS_PORT || '';
const dorisUser = process.env.DORIS_USER || '';
const dorisPassword = process.env.DORIS_PASSWORD || '';
const dorisDatabase = process.env.DORIS_DATABASE || '';

console.log('Doris Connection Info:', { dorisHost, dorisPort, dorisUser, dorisDatabase });

// Function to get the list of assets
async function getAssets(): Promise<string[]> {
    try {
        const options = {
            contractAddress: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N',
            contractName: 'pool-0-reserve-v1-2',
            functionName: 'get-assets',
            functionArgs: [],
            network,
            senderAddress: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N',
        };
        
        const result = await callReadOnlyFunction(options);
        const assets = cvToJSON(result).value;
        return assets.map((asset: any) => asset.value);
    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    }
}

// Function to get the reserve state of an asset
async function getReserveState(asset: string): Promise<any> {
    try {
        const functionName = 'get-reserve-state';
        const assetPrincipal = principalCV(asset);

        const options = {
            contractAddress: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N',
            contractName: 'pool-0-reserve-v1-2',
            functionName,
            functionArgs: [assetPrincipal],
            network,
            senderAddress: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N',
        };

        const result = await callReadOnlyFunction(options);
        const reserveState = cvToJSON(result).value;
        return reserveState;
    } catch (error) {
        console.error(`Error fetching reserve state for asset ${asset}:`, error);
        throw error;
    }
}

// Function to extract assets and reserve states
async function extractAssetsAndReserveStates() {
    try {
        console.log('Getting Assets');
        const assets = await getAssets();
        console.log('Assets:', assets);

        for (const asset of assets) {
            console.log(`Fetching reserve state for asset: ${asset}`);
            const reserveState = await getReserveState(asset);
            console.log(`Reserve State for ${asset}:`, reserveState);

            // Here you would insert the reserve state into Doris (using Doris connection)
            // Example (pseudo-code):
            // await dorisClient.insert('INSERT INTO reserve_states VALUES (...)', reserveState);
        }
    } catch (error) {
        console.error('Error extracting assets and reserve states:', error);
    }
}

extractAssetsAndReserveStates();
