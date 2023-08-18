import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { GatewaySession } from './app.gateway.session';

@Module({
  providers: [
    AppGateway,
    {
      provide: 'GATEWAY_SESSION',
      useClass: GatewaySession,
    },
  ],
})
export class GatewayModule {}
