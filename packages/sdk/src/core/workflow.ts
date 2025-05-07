import { UserDefinedPayload } from '@/models/workflows';

export const payload = (payload: UserDefinedPayload) => {
  return JSON.stringify(payload);
};
