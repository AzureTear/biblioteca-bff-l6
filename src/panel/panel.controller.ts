import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtGuard, type Usuario } from '../auth/jwt.guard.js';
import { RolGuard } from '../auth/rol.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { PanelService } from './panel.service.js';

@Controller('panel')
@UseGuards(JwtGuard, RolGuard)
export class PanelController {
  constructor(private readonly panel: PanelService) {}

  @Get()
  async mios(@Req() req: { usuario: Usuario }) {
    return {
      usuario: { sub: req.usuario.sub, grupos: req.usuario.grupos },
      ...(await this.panel.mios(req.usuario.sub)),
    };
  }

  @Get('serie')
  async serie(@Req() req: { usuario: Usuario }) {
    return this.panel.miosEnSerie(req.usuario.sub);
  }

  @Get('todos')
  @Roles('bibliotecarios')
  async todos(@Req() req: { usuario: Usuario }) {
    return {
      usuario: { sub: req.usuario.sub, grupos: req.usuario.grupos },
      ...(await this.panel.todos()),
    };
  }
}
