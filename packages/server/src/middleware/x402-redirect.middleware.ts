// proxy.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction, response } from 'express';
import axios from 'axios';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { withPaymentInterceptor, decodeXPaymentResponse } from 'x402-axios';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyMiddleware.name);

  async use(req: Request, res: Response, next: NextFunction) {
    const isBeastMode = req.query.isBeastMode === 'true' || req.body?.isBeastMode === true;

    this.logger.log('Trigger x402 middleware');

    if (isBeastMode) {
      try {
        // Get server private key - In the future, we will take Privy's delegated private key of admin
        const privateKey = process.env.PRIVATE_KEY as Hex;

        if (!privateKey) {
          throw new Error('PRIVATE_KEY is not set');
        }

        // Create a wallet from the private key
        const account = privateKeyToAccount(privateKey);

        const axiosInstance = withPaymentInterceptor(
          axios.create({
            baseURL: `${req.protocol}://${req.get('Host')}`,
          }),
          account
        );
        this.logger.log('Processing request to x402 /growly');

        // Make internal call to another controller endpoint
        const response = await axiosInstance.post('growly', req.body);
        const paymentResponse = decodeXPaymentResponse(response.headers['x-payment-response']);

        this.logger.log(paymentResponse);

        // Directly respond to client
        return res.status(response.status).json(response.data);
      } catch (err) {
        return res.status(err.response?.status || 500).json({
          error: 'Internal proxy call failed',
          details: err.message,
        });
      }
    }

    // If isBeastMode is not set, continue normal route handling
    next();
  }
}
