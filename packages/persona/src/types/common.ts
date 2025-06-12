export type Address = `0x${string}`;
export interface ApiError {
  error: string;
  message: string;
  status_code: number;
}
