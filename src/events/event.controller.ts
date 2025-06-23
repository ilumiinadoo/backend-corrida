import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @Req() req: Request) {
    return this.eventService.create(dto, (req.user as any)['userId']);
  }

  @Get('group/:groupId')
  async findAllByGroup(@Param('groupId') groupId: string) {
    return this.eventService.findAllByGroup(groupId);
  }

  @Get('group/:groupId/futuros')
  getFuturosPorGrupo(@Param('groupId') groupId: string) {
    return this.eventService.findFuturosByGroupId(groupId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.eventService.remove(id, (req.user as any)['userId']);
  }

  @Post(':id/attendance')
  async confirmAttendance(
    @Param('id') id: string,
    @Body('status') status: 'confirmed' | 'maybe' | 'declined',
    @Req() req: Request
  ) {
    return this.eventService.confirmAttendance(id, (req.user as any)['userId'], status);
  }
}
