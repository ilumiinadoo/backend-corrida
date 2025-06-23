import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from './group.schema';
import { User } from '../users/user.schema';
import { Activity } from '../activities/activity.schema';
import { Route } from '../routes/route.schema';
import { Accomplishment } from '../accomplishments/accomplishment.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @InjectModel(Accomplishment.name) private accomplishmentModel: Model<Accomplishment>,
    @InjectModel(Route.name) private routeModel: Model<Route>,
  ) {}

  // ========= CRUD de Grupos =========

  async create(userId: string, dto: { nome: string; descricao?: string }) {
    return this.groupModel.create({
      ...dto,
      criadorId: userId,
      administradores: [userId],
      membros: [userId],
    });
  }

  async listAll() {
    return this.groupModel.find();
  }

  async findById(id: string) {
    return this.groupModel.findById(id);
  }

  async deleteGroup(id: string): Promise<{ message: string }> {
    const result = await this.groupModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Grupo não encontrado');
    return { message: 'Grupo excluído com sucesso.' };
  }

  async findByAdmin(userId: string) {
    return this.groupModel.find({ administradores: userId });
  }

  // ========= Participação e Controle de Membros =========

  async requestJoin(groupId: string, userId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Grupo não encontrado');

    if (group.membros.includes(userId) || group.pendentes.includes(userId)) {
      return group; // Já é membro ou já tem solicitação pendente
    }

    group.pendentes.push(userId);
    return group.save();
  }

  async approveMember(groupId: string, userId: string, approverId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Grupo não encontrado');

    if (!group.administradores.includes(approverId)) {
      throw new ForbiddenException('Apenas administradores podem aprovar membros.');
    }

    group.pendentes = group.pendentes.filter((id) => id !== userId);
    group.membros.push(userId);
    return group.save();
  }

  async promoteToAdmin(groupId: string, targetId: string, requesterId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Grupo não encontrado');

    if (!group.administradores.includes(requesterId)) {
      throw new ForbiddenException('Apenas administradores podem promover membros.');
    }

    if (!group.membros.includes(targetId)) {
      throw new BadRequestException('Usuário não faz parte do grupo.');
    }

    if (!group.administradores.includes(targetId)) {
      group.administradores.push(targetId);
    }

    return group.save();
  }

  async removeMember(groupId: string, userId: string, requesterId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Grupo não encontrado');

    if (!group.administradores.includes(requesterId)) {
      throw new ForbiddenException('Apenas administradores podem remover membros.');
    }

    const isMember = group.membros.includes(userId);
    if (!isMember) {
      throw new BadRequestException('Usuário não faz parte do grupo.');
    }

    group.membros = group.membros.filter((id) => id.toString() !== userId);
    group.administradores = group.administradores.filter((id) => id.toString() !== userId);

    await group.save();
    return { message: 'Membro removido com sucesso.' };
  }

  async leaveGroup(groupId: string, userId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Grupo não encontrado');

    const isMember = group.membros.includes(userId);
    if (!isMember) throw new BadRequestException('Você não faz parte deste grupo.');

    const isAdmin = group.administradores.includes(userId);

    if (isAdmin && group.administradores.length === 1) {
      throw new BadRequestException('Você é o único administrador. Nomeie outro antes de sair.');
    }

    group.membros = group.membros.filter((id) => id.toString() !== userId);
    if (isAdmin) {
      group.administradores = group.administradores.filter((id) => id.toString() !== userId);
    }

    await group.save();
    return { message: 'Você saiu do grupo com sucesso.' };
  }

  // ========= Relatórios e Consultas =========

  async getFeed(groupId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Grupo não encontrado');

    return this.activityModel
      .find({ userId: { $in: group.membros } })
      .sort({ data: -1 })
      .lean();
  }

  async getGroupRankings(groupId: string) {
    const group = await this.groupModel.findById(groupId).lean();

    if (!group) throw new NotFoundException('Grupo não encontrado');

    const rankings = {
      iniciante: [],
      'intermediário': [],
      'avançado': [],
    };

    const validNiveis = ['iniciante', 'intermediário', 'avançado'];

    for (const userId of group.membros) {
      const user = await this.userModel.findById(userId).lean();
      if (!user || !user.nivelExperiencia || !validNiveis.includes(user.nivelExperiencia)) continue;


      const accomplishments = await this.accomplishmentModel.find({
        usuarioId: user._id,
        grupoId: groupId,
      }).lean();

      for (const acc of accomplishments) {
        rankings[user.nivelExperiencia].push({
          userId: user._id,
          nome: user.nome,
          foto: user.foto,
          mediaRitmo: acc.ritmoMedio,
          data: acc.data,
          accomplishmentId: acc._id,
        });
      }
    }

    // Ordenar cada nível pelo melhor ritmo
    for (const nivel in rankings) {
      rankings[nivel] = rankings[nivel].sort((a, b) => a.mediaRitmo - b.mediaRitmo);
    }

    return rankings;
  }
}
