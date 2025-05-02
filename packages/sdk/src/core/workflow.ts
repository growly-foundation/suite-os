import { UserDefinedPayload } from '@/models/workflow';

export const payload = (payload: UserDefinedPayload) => {
  return JSON.stringify(payload);
};
