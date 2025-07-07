-- Use this seed to create the tables on AWS Athena

-- Create the RAW transactions table
CREATE TABLE IF NOT EXISTS `raw`.transactions (
  chain_id int,
  block_number string,
  block_hash string,
  timestamp string,
  hash string,
  nonce string,
  transaction_index string,
  from string,
  to string,
  value string,
  gas string,
  gas_price string,
  input string,
  method_id string,
  function_name string,
  contract_address string,
  cumulative_gas_used string,
  txreceipt_status string,
  gas_used string,
  confirmations string,
  is_error string,
  block_date date,
  block_time timestamp
)
PARTITIONED BY (chain_id, block_date)
TBLPROPERTIES ('table_type' = 'iceberg')

-- Create the RAW cursor table
CREATE TABLE IF NOT EXISTS `raw`.cursor (
  chain_id int,
  contract_address string,
  start_block string,
  end_block string,
  updated_at timestamp
)
PARTITIONED BY (chain_id)
TBLPROPERTIES ('table_type' = 'iceberg')
;

-- Create the STANDARDIZED contracts table
CREATE TABLE IF NOT EXISTS `standardized`.contracts (
  chain_id int,
  contract_address string,
  abi_json string,
  label string,
  is_proxy boolean,
  updated_at timestamp
)
PARTITIONED BY (chain_id)
TBLPROPERTIES ('table_type' = 'iceberg')
