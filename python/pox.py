import requests

# API base URL for Stacks mainnet
STACKS_API_URL = 'https://api.hiro.so'
contract_address = "SP000000000000000000002Q6VF78"
contract_name = "pox-4"
sender = "SP3TRVBX53CN78AS8C3HNTM3GPNDHGA34F9M7MAH2" 

# Function to get the number of stackers for a specific cycle
def get_no_stackers(value):
    function_name = "get-reward-set-size"

    # Create the full API endpoint URL
    url = f"{STACKS_API_URL}/v2/contracts/call-read/{contract_address}/{contract_name}/{function_name}"

    # Payload for the specified cycle
    payload = {
        "sender": sender,  # Sender address
        "arguments": [generate_hex(value)]  # Hex argument for the cycle
    }

    # Make the POST request
    response = requests.post(url, json=payload)

    # Print the status code and response for debugging
    print(f"Status Code: {response.status_code}")
    print("Response Text:")
    print(response.text)  # Print raw response

    # If the response is successful, attempt to parse the result
    if response.status_code == 200:
        try:
            response_json = response.json()
            result = response_json.get('result', None)
            result = decode_hex(result)
            
            if result is not None:
                # Print and return the number of stackers
                print(f"Number of stackers: {result}")
                return result
            else:
                print("No result found in response.")
                return None
        except Exception as e:
            print(f"Error parsing response: {e}")
            return None
    else:
        print("Failed to retrieve data. Please check the API request.")
        return None

# Function to get stacker information for a specific cycle and index
def get_stackers_by_cycle(cycle, index):

    function_name = "get-reward-set-pox-address"

    # Create the full API endpoint URL
    url = f"{STACKS_API_URL}/v2/contracts/call-read/{contract_address}/{contract_name}/{function_name}"

    # Payload for the cycle and index
    payload = {
        "sender": sender,  
        "arguments": [generate_hex(cycle), generate_hex(index)]  # Cycle and index arguments in hex
    }

    # Make the POST request
    response = requests.post(url, json=payload)

    # Print the status code and response for debugging
    print(f"Status Code: {response.status_code}")
    print(f"Cycle {cycle}, Index {index} Response Text:")
    print(response.text)  # Print raw response

    # If the response is successful, attempt to parse the result
    if response.status_code == 200:
        try:
            response_json = response.json()
            result = response_json.get('result', None)
            
            if result:
                # Print the stacker info
                print(f"Stacker info (cycle {cycle}, index {index}): {result}")
            else:
                print(f"No result found for cycle {cycle}, index {index}.")
        except Exception as e:
            print(f"Error parsing response for cycle {cycle}, index {index}: {e}")
    else:
        print(f"Failed to retrieve data for cycle {cycle}, index {index}. Please check the API request.")

def get_cycle_data(cycle):
    function_name = "get-total-ustx-stacked"

    # Create the full API endpoint URL
    url = f"{STACKS_API_URL}/v2/contracts/call-read/{contract_address}/{contract_name}/{function_name}"

    # Payload for the specified cycle
    payload = {
        "sender": sender,  # Sender address
        "arguments": [generate_hex(cycle)]  # Hex argument for the cycle
    }

    # Make the POST request
    response = requests.post(url, json=payload)

    # Print the status code and response for debugging
    print(f"Status Code: {response.status_code}")
    print("Response Text:")
    print(response.text)  # Print raw response

    # If the response is successful, attempt to parse the result
    if response.status_code == 200:
        try:
            response_json = response.json()
            result = response_json.get('result', None)
            result = decode_hex(result) / 1e6  # Convert to appropriate units
            
            if result:
                # Print the total uSTX stacked
                print(f"Total uSTX stacked: {result}")
            else:
                print("No result found in response.")
        except Exception as e:
            print(f"Error parsing response: {e}")
    else:
        print("Failed to retrieve data. Please check the API request.")

def generate_hex(value):
    # Convert the value to hexadecimal and remove the "0x" prefix
    hex_value = format(value, 'x')
    
    # Pad with leading zeroes to ensure it's 33 characters
    padded_value = hex_value.zfill(33)
    
    # Prepend "01" in front and adjust the length accordingly
    final_hex = "01" + padded_value[1:]  # Replace the first zero with '01'
    
    # Add the "0x" prefix
    return "0x" + final_hex

def decode_hex(value):
    # Ensure the input starts with '0x' and remove it
    if value.startswith('0x'):
        value = value[2:]
    
    # Remove leading '01' (first two characters) and all leading zeros afterward
    if value.startswith('01'):
        value = value[2:]  # Remove '01'
    
    # Strip any remaining leading zeros
    stripped_value = value.lstrip('0')
    
    if stripped_value == '':
        return 0
    
    # Convert the remaining hex string to decimal
    decimal_value = int(stripped_value, 16)
    
    return decimal_value

# Main execution
if __name__ == "__main__":
    cycle = 94

    # Get total uSTX stacked for the cycle
    get_cycle_data(cycle)
    
    # Get the number of stackers for the cycle
    number_of_stackers = get_no_stackers(cycle)
    
    # If the number of stackers is retrieved successfully, iterate and get each stacker's info
    if number_of_stackers is not None:
        for index in range(number_of_stackers):
            get_stackers_by_cycle(cycle, index)
