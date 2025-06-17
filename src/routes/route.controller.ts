import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common'
import { RouteService } from './route.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  // ✅ Criar uma nova rota associada a um grupo
  @Post()
  async createRoute(@Req() req, @Body() body: any) {
    if (!req.user?.userId) {
    throw new Error('Usuário não autenticado.')
  }
  const userId = req.user.userId
  console.log('🔐 req.user:', req.user);
    return this.routeService.createRoute({
      ...body,
      criadoPor: userId,
    })
  }

  // ✅ Buscar todas as rotas de grupos dos quais o usuário participa
  @Get()
  async findAllByUser(@Req() req) {
    if (!req.user?.userId) {
    throw new Error('Usuário não autenticado.')
  }
  const userId = req.user.userId
    return this.routeService.findRoutesForUser(userId)
  }

  // ✅ Buscar rotas por ID de grupo (ex: /routes/groups/:groupId)
  @Get('groups/:groupId')
  async getRoutesByGroup(@Param('groupId') groupId: string) {
    return this.routeService.findByGroup(groupId)
  }

  // ✅ Buscar rota específica por ID (ex: /routes/specific/:id)
  // ⚠️ IMPORTANTE: precisa vir ANTES de ":id" genérico, senão nunca será chamado
  @Get('specific/:id')
  async getRouteById(@Param('id') id: string) {
    //console.log('📥 Buscando rota pelo ID:', id)
    return this.routeService.findById(id)
  }

  // ✅ Excluir uma rota por ID (ex: /routes/:id)
  @Delete(':id')
  async deleteRoute(@Param('id') id: string, @Req() req: any) {
    if (!req.user?.userId) {
    throw new Error('Usuário não autenticado.')
  }
  const userId = req.user.userId
    return this.routeService.deleteRoute(id, userId)
  }

  // ⚠️ Rota genérica para buscar por ID, opcional se "specific/:id" for suficiente
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.routeService.findById(id)
  }
}
