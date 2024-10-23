var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { callReadOnlyFunction, cvToJSON, principalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise'; // Import mysql2 for MySQL-like databases
// Load environment variables from .env
dotenv.config();
const network = new StacksMainnet();
// Doris environment variables
const dorisHost = process.env.DORIS_HOST || '';
const dorisPort = process.env.DORIS_PORT || '';
const dorisUser = process.env.DORIS_USER || '';
const dorisPassword = process.env.DORIS_PASSWORD || '';
const dorisDatabase = process.env.DORIS_DATABASE || '';
function parseReserveState(result) {
    return {
        a_token_address: result.value['a-token-address'].value,
        accrued_to_treasury: BigInt(result.value['accrued-to-treasury'].value),
        base_ltv_as_collateral: BigInt(result.value['base-ltv-as-collateral'].value),
        borrow_cap: BigInt(result.value['borrow-cap'].value),
        borrowing_enabled: result.value['borrowing-enabled'].value,
        current_liquidity_rate: BigInt(result.value['current-liquidity-rate'].value),
        current_variable_borrow_rate: BigInt(result.value['current-variable-borrow-rate'].value),
        decimals: Number(result.value['decimals'].value),
        interest_rate_strategy_address: result.value['interest-rate-strategy-address'].value,
        is_active: result.value['is-active'].value,
        is_frozen: result.value['is-frozen'].value,
        liquidation_threshold: BigInt(result.value['liquidation-threshold'].value),
        oracle: result.value['oracle'].value,
        total_borrows_variable: BigInt(result.value['total-borrows-variable'].value),
        usage_as_collateral_enabled: result.value['usage-as-collateral-enabled'].value,
    };
}
// Set up MySQL (Doris) client using mysql2
const dorisClient = mysql.createPool({
    host: dorisHost,
    port: parseInt(dorisPort, 10),
    user: dorisUser,
    password: dorisPassword,
    database: dorisDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// Function to get the list of assets
function getAssets() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = {
                contractAddress: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N',
                contractName: 'pool-0-reserve-v1-2',
                functionName: 'get-assets',
                functionArgs: [],
                network,
                senderAddress: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N',
            };
            const result = yield callReadOnlyFunction(options);
            const assets = cvToJSON(result).value;
            return assets.map((asset) => asset.value);
        }
        catch (error) {
            console.error('Error fetching assets:', error);
            throw error;
        }
    });
}
// Function to get the reserve state of an asset
function getReserveState(asset) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield callReadOnlyFunction(options);
            const reserveState = cvToJSON(result).value;
            return reserveState;
        }
        catch (error) {
            console.error(`Error fetching reserve state for asset ${asset}:`, error);
            throw error;
        }
    });
}
function insertReserveStateIntoDoris(asset, reserveState) {
    return __awaiter(this, void 0, void 0, function* () {
        const asset_name = asset.split('.')[1];
        const query = `
      INSERT INTO stacks.dapps_zest 
      (asset_name, a_token_address, accrued_to_treasury, base_ltv_as_collateral, 
      borrow_cap, borrowing_enabled, current_liquidity_rate, 
      current_variable_borrow_rate, decimals, updated_at) 
      VALUES 
      ('${asset_name}', '${asset}', '${reserveState.accrued_to_treasury}', '${reserveState.base_ltv_as_collateral}', 
      '${reserveState.borrow_cap}', '${reserveState.borrowing_enabled}', '${reserveState.current_liquidity_rate}', 
      '${reserveState.current_variable_borrow_rate}','${reserveState.decimals}', 
      NOW());
    `;
        // Log the values before executing the query
        console.log('Inserting into Doris:', {
            asset,
            accrued_to_treasury: reserveState.accrued_to_treasury,
            base_ltv_as_collateral: reserveState.base_ltv_as_collateral,
            borrow_cap: reserveState.borrow_cap,
            borrowing_enabled: reserveState.borrowing_enabled,
            current_liquidity_rate: reserveState.current_liquidity_rate,
            current_variable_borrow_rate: reserveState.current_variable_borrow_rate,
            decimals: reserveState.decimals,
            interest_rate_strategy_address: reserveState.interest_rate_strategy_address,
            is_active: reserveState.is_active,
            is_frozen: reserveState.is_frozen,
            liquidation_threshold: reserveState.liquidation_threshold,
            oracle: reserveState.oracle,
            total_borrows_variable: reserveState.total_borrows_variable,
            usage_as_collateral_enabled: reserveState.usage_as_collateral_enabled,
        });
        // Execute the query
        yield dorisClient.query(query);
    });
}
// Function to extract assets and reserve states
export function extractAssetsAndReserveStates() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Getting Assets');
            const assets = yield getAssets();
            console.log('Assets:', assets);
            for (const asset of assets) {
                // console.log(`Fetching reserve state for asset: ${asset}`);
                const reserveState = yield getReserveState(asset);
                console.log(`Reserve State for ${asset}:`, reserveState);
                const parsedReserveState = parseReserveState(reserveState);
                yield insertReserveStateIntoDoris(asset, parsedReserveState);
                console.log(`Inserted reserve state for ${asset} into Doris`);
            }
        }
        catch (error) {
            console.error('Error extracting assets and reserve states:', error);
        }
        finally {
            yield dorisClient.end();
            console.log('Disconnected from Doris database');
        }
    });
}
extractAssetsAndReserveStates();
