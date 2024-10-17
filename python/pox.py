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

    # Hardcoded payload for cycle 94
    payload = {
        "sender": sender,  # Sender address
        "arguments": [generate_hex(value)]  # Hardcoded hex argument for cycle 94
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
            
            if result:
                # Just print the result string directly
                print(f"Number of stackers: {result}")
            else:
                print("No result found in response.")
        except Exception as e:
            print(f"Error parsing response: {e}")
    else:
        print("Failed to retrieve data. Please check the API request.")

# Function to get stacker information for a specific cycle and index
def get_stackers_by_cycle(cycle, index):

    function_name = "get-reward-set-pox-address"

    # Create the full API endpoint URL
    url = f"{STACKS_API_URL}/v2/contracts/call-read/{contract_address}/{contract_name}/{function_name}"

    # Convert cycle and index to hex, both padded to 8 characters
    cycle_hex = f"0x{cycle:08x}"
    index_hex = f"0x{index:08x}"

    # Hardcoded payload for the cycle and index
    payload = {
        "sender": sender,  # Sender address
        "arguments": [cycle_hex, index_hex]  # Cycle and index arguments in hex
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
            
            if result:
                # Just print the result string directly
                print(f"Stacker info (cycle {cycle}, index {index}): {result}")
            else:
                print("No result found in response.")
        except Exception as e:
            print(f"Error parsing response: {e}")
    else:
        print("Failed to retrieve data. Please check the API request.")

def get_cycle_data(cycle):
    function_name = "get-total-ustx-stacked"

    # Create the full API endpoint URL
    url = f"{STACKS_API_URL}/v2/contracts/call-read/{contract_address}/{contract_name}/{function_name}"

    # Hardcoded payload for cycle 94
    payload = {
        "sender": sender,  # Sender address
        "arguments": [generate_hex(94)]  # Hardcoded hex argument for cycle 94
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
            result = decode_hex(result) / 1e6
            
            if result:
                # Just print the result string directly
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
    
    # Pad with leading zeroes to ensure it's 16 characters (128 bits) long
    padded_value = hex_value.zfill(33)  # 32 characters (128 bits)
    
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
    
    # Convert the remaining hex string to decimal
    decimal_value = int(stripped_value, 16)
    
    return decimal_value

# Function to get the total uSTX stacked for a specific cycle


get_cycle_data(94)
get_no_stackers(94)

# get_stackers_by_cycle(94, 0)


