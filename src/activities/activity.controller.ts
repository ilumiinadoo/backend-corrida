import { Body, Controller, Get, Post, Request, UseGuards, Param, NotFoundException, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from './activity.schema';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  async createActivity(@Request() req, @Body() createActivityDto: CreateActivityDto) {
    const userId = req.user.userId;
    return this.activityService.create(userId, createActivityDto);
  }

  @Get()
  async getUserActivities(@Request() req) {
    const userId = req.user.userId;
    return this.activityService.findAllByUser(userId);
  }

  @Get('users/:userId')
  async findByUser(@Param('userId') userId: string): Promise<Activity[]> {
    return this.activityService.findByUser(userId);
  }

  @Post('calculate-route')
  async calculateRoute(@Body() body: { inicio: { lat: number; lng: number }; fim: { lat: number; lng: number } }) {
    return this.activityService.calcularRotaEntrePontos(body.inicio, body.fim);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.activityService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Atividade não encontrada');
    }
    return { message: 'Atividade excluída com sucesso' };
  }
}
