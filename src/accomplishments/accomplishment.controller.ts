import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { AccomplishmentService } from './accomplishment.service';
import { CreateAccomplishmentDto } from './dto/create-accomplishment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('accomplishments')
export class AccomplishmentController {
  constructor(private readonly accomplishmentService: AccomplishmentService) {}

  @Post()
  async criar(@Body() dto: CreateAccomplishmentDto, @Request() req) {
    //console.log('🔥 req.user:', req.user); // debug
    const usuarioId = req.user.userId;
    return this.accomplishmentService.criar(dto, usuarioId);
  }

  @Get('routes/:rotaId')
  async listarPorRota(@Param('rotaId') rotaId: string) {
    return this.accomplishmentService.listarPorRota(rotaId);
  }
}