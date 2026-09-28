import { Module } from '@nestjs/common';
import { PanelController } from './panel.controller.js';
import { PanelService } from './panel.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Module({
  controllers: [PanelController],
  providers: [PanelService, JwtGuard],
})
export class PanelModule {}
