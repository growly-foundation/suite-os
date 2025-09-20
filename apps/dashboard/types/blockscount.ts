export interface GetAddressCounterResponse {
  transactions_count: string;
  token_transfers_count: string;
  gas_usage_count: string;
  validations_count: string;
}

export interface GetAddressTransactionsResponse {
  items: BlockscoutTransaction[];
  next_page_params: BlockscoutNextPageParams;
}

export interface GetAddressTokenTransfersResponse {
  items: BlockscoutTokenTransfer[];
  next_page_params: BlockscoutNextPageParams;
}

export interface BlockscoutTokenTransfer {
  block_hash: string;
  block_number: number;
  from: BlockscoutIdentity;
  log_index: number;
  method: string;
  timestamp: Date;
  to: BlockscoutIdentity;
  token: BlockscoutToken;
  total: TokenTotal;
  transaction_hash: string;
  type: TransactionType;
}

export interface BlockscoutToken {
  address_hash: string;
  circulating_market_cap: null | string;
  decimals: null | string;
  exchange_rate: null | string;
  holders_count: string;
  icon_url: null | string;
  name: string;
  symbol: null | string;
  total_supply: null | string;
  type: TokenType;
  volume_24h: null | string;
}

export interface BlockscoutTransaction {
  priority_fee: null | string;
  raw_input: string;
  result: BlockscoutResult;
  hash: string;
  max_fee_per_gas: null | string;
  revert_reason: null;
  confirmation_duration: number[];
  transaction_burnt_fee: null | string;
  type: number;
  token_transfers_overflow: null;
  confirmations: number;
  position: number;
  max_priority_fee_per_gas: null | string;
  transaction_tag: null;
  created_contract: null;
  value: string;
  from: BlockscoutIdentity;
  gas_used: string;
  status: BlockscoutStatus;
  to: BlockscoutIdentity;
  authorization_list: any[];
  method: null | string;
  fee: Fee;
  actions: any[];
  gas_limit: string;
  gas_price: string;
  decoded_input: BlockscoutDecodedInput | null;
  token_transfers: null;
  base_fee_per_gas: string;
  timestamp: Date;
  nonce: number;
  historic_exchange_rate: string;
  transaction_types: TransactionType[];
  exchange_rate: string;
  block_number: number;
  has_error_in_internal_transactions: boolean | null;
}

export interface BlockscoutDecodedInput {
  method_call: string;
  method_id: string;
  parameters: BlockscoutParameter[];
}

export interface BlockscoutParameter {
  name: string;
  type: string;
  value: string[] | string;
}

export interface Fee {
  type: string;
  value: string;
}

export enum TokenType {
  Erc1155 = 'ERC-1155',
  Erc20 = 'ERC-20',
  Erc721 = 'ERC-721',
}

export interface TokenTotal {
  decimals?: null | string;
  token_id?: string;
  token_instance?: TokenInstance;
  value?: string;
}

export interface TokenInstance {
  animation_url: null;
  external_app_url: null | string;
  id: string;
  image_url: null | string;
  is_unique: null;
  media_type: null;
  media_url: null | string;
  metadata: TokenInstanceMetadata | null;
  owner: null;
  thumbnails: null;
  token: BlockscoutToken;
}

export interface TokenInstanceMetadata {
  attributes?: { trait_type: string; value: string }[];
  description: string;
  image: string;
  name: string;
  external_url?: string;
  nameExpires?: number;
}

export interface BlockscoutIdentity {
  ens_domain_name: string | null;
  hash: string;
  implementations: Implementation[];
  is_contract: boolean;
  is_scam: boolean;
  is_verified: boolean;
  metadata: Metadata | null;
  name: null | string;
  private_tags: any[];
  proxy_type: BlockscoutProxyType | null;
  public_tags: any[];
  watchlist_names: any[];
}

export interface Implementation {
  address_hash: string;
  name: null | string;
}

export interface Metadata {
  tags: Tag[];
}

export interface Tag {
  meta: Meta;
  name: string;
  ordinal: number;
  slug: string;
  tagType: TagType;
}

export interface Meta {
  appID?: string;
  main_entity?: string;
  projectName?: string;
  tagUrl?: string;
  tokenAttributes?: string;
  tooltipDescription?: string;
  tooltipUrl?: string;
  appActionButtonText?: string;
  appLogoURL?: string;
  bgColor?: string;
  textColor?: string;
}

export enum TagType {
  Name = 'name',
  Protocol = 'protocol',
}

export enum BlockscoutProxyType {
  Eip1967 = 'eip1967',
  Unknown = 'unknown',
}

export enum BlockscoutResult {
  Success = 'success',
}

export enum BlockscoutStatus {
  Ok = 'ok',
}

export enum TransactionType {
  CoinTransfer = 'coin_transfer',
  ContractCall = 'contract_call',
  TokenTransfer = 'token_transfer',
  TokenMinting = 'token_minting',
}

export interface BlockscoutNextPageParams {
  index: number;
  value: string;
  hash: string;
  inserted_at: Date;
  block_number: number;
  fee: string;
  items_count: number;
}
