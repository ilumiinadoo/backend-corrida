import { Controller, Post, Body, Request, UseGuards, Get, Param, Patch, Delete } from '@nestjs/common'
import { GroupService } from './group.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupController {
  constructor(private service: GroupService) {}

  @Post()
  async create(@Request() req, @Body() body) {
    return this.service.create(req.user.userId, body)
  }

  @Get()
  async listAll() {
    return this.service.listAll()
  }

  @Post(':id/join')
  async join(@Request() req, @Param('id') groupId: string) {
    return this.service.requestJoin(groupId, req.user.userId)
  }

  @Patch(':id/approve/:userId')
  async approve(@Request() req, @Param('id') groupId: string, @Param('userId') userId: string) {
    return this.service.approveMember(groupId, userId, req.user.userId)
  }

  @Patch(':id/promote/:userId')
  async promote(@Request() req, @Param('id') groupId: string, @Param('userId') userId: string) {
    return this.service.promoteToAdmin(groupId, userId, req.user.userId)
  }

  @Get('admin')
  async getAdminGroup(@Request() req) {
    return this.service.findByAdmin(req.user.userId)
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Get(':id/feed')
  async getFeed(@Param('id') id: string) {
    return this.service.getFeed(id)
  }

  @Get(':id/rankings')
  async getGroupRankings(@Param('id') groupId: string) {
    return this.service.getGroupRankings(groupId);
  }

  @Delete(':id')
  async deleteGroup(@Param('id') id: string) {
    return this.service.deleteGroup(id);
  }

  @Patch(':groupId/remove-member/:userId')
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    const requesterId = req.user.userId; // Usuário que está fazendo a requisição
    return this.service.removeMember(groupId, userId, requesterId);
  }

}
