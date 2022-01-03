import { Module } from '@nestjs/common';
import { OuistitiGateway } from './ouistiti.gateway';

@Module({
  controllers: [],
  providers: [
    OuistitiGateway
  ],
  exports: [],
})
export class OuistitiModule {}
