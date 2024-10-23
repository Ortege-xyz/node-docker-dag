import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Cube.js API URL and Token from .env
const REST_LOAD_URL = "https://api-staging.ortege.ai/cubejs-api/v1/load/";
const ortegeToken = process.env.ORTEGE_TOKEN; // Make sure this token is properly set in your .env file

// Function to query Cube.js REST API
async function restApiQuery(queryPayload) {
  try {
    const response = await fetch(REST_LOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ortegeToken}`
      },
      body: JSON.stringify(queryPayload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('\n--- REST API Query Result ---');
      console.log(JSON.stringify(data, null, 2));
    } else {
      throw new Error(`REST API query failed: ${response.status} - ${await response.text()}`);
    }
  } catch (error) {
    console.error('Error fetching data from Cube.js API:', error);
  }
}

// Function to create the query payload for stacks tokens
function stacksTokensQuery() {
  return {
    "query": {
      "dimensions": [
        "stacks_tokens.contract_id",
        "stacks_tokens.name",
        "stacks_tokens.symbol",
        "stacks_tokens.decimals"
      ]
    }
  };
}

// Main function to execute the query
async function main() {
  const queryPayload = stacksTokensQuery();
  await restApiQuery(queryPayload);
}

// Call the main function
main();
