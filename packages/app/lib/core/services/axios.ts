import axios from 'axios';

export class AxiosService {
  async post<T extends Record<string, any>, R>(route: string, payload: T): Promise<R> {
    try {
      const response = await axios.post<R>(route, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async get<R>(route: string): Promise<R> {
    try {
      const response = await axios.get<R>(route);
      return response.data;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
