import { Controller, Post, Body, Request, UseGuards, Get, Param, Patch, Delete } from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupController {
  constructor(private service: GroupService) {}

  // ========= CRUD BÁSICO DE GRUPO =========

  @Post()
  async create(@Request() req, @Body() body) {
    return this.service.create(req.user.userId, body);
  }

  @Get()
  async listAll() {
    return this.service.listAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Delete(':id')
  async deleteGroup(@Param('id') id: string) {
    return this.service.deleteGroup(id);
  }

  // ========= PARTICIPAÇÃO EM GRUPOS =========

  @Post(':id/join')
  async requestJoin(@Request() req, @Param('id') groupId: string) {
    return this.service.requestJoin(groupId, req.user.userId);
  }

  @Patch(':groupId/leave')
  async leaveGroup(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.userId;
    return this.service.leaveGroup(groupId, userId);
  }

  @Patch(':groupId/remove-member/:userId')
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    const requesterId = req.user.userId;
    return this.service.removeMember(groupId, userId, requesterId);
  }

  @Patch(':id/approve/:userId')
  async approveMember(
    @Request() req,
    @Param('id') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.approveMember(groupId, userId, req.user.userId);
  }

  @Patch(':id/promote/:userId')
  async promoteToAdmin(
    @Request() req,
    @Param('id') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.promoteToAdmin(groupId, userId, req.user.userId);
  }

  // ========= CONSULTAS RELACIONADAS =========

  @Get(':id/feed')
  async getFeed(@Param('id') id: string) {
    return this.service.getFeed(id);
  }

  @Get(':id/rankings')
  async getGroupRankings(@Param('id') groupId: string) {
    return this.service.getGroupRankings(groupId);
  }

  @Get('admin')
  async getAdminGroups(@Request() req) {
    return this.service.findByAdmin(req.user.userId);
  }
}
