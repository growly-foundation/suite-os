export type Address = `0x${string}`;
export type Basename = `${string}.base.eth`;
export interface ApiError {
  error: string;
  message: string;
  status_code: number;
}
