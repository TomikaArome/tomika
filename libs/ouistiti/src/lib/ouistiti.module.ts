import { Module } from '@nestjs/common';
import { OuistitiGateway } from './ouistiti.gateway';
import { OuistitiService } from './ouistiti.service';

@Module({
  controllers: [],
  providers: [OuistitiGateway, OuistitiService],
  exports: [],
})
export class OuistitiModule {}
