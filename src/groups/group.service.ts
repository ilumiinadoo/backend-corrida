import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Group } from './group.schema'
import { User } from '../users/user.schema';
import { Activity } from '../activities/activity.schema'
import { Route } from '../routes/route.schema';
import { Accomplishment } from '../accomplishments/accomplishment.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Group.name) private model: Model<Group>,
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @InjectModel(Accomplishment.name) private accomplishmentModel: Model<Accomplishment>,
    @InjectModel(Route.name) private routeModel: Model<Route>,
  ) {}

  async create(userId: string, dto: { nome: string; descricao?: string }) {
    return this.model.create({
      ...dto,
      criadorId: userId,
      administradores: [userId],
      membros: [userId],
    })
  }

  async listAll() {
    return this.model.find()
  }

  async requestJoin(groupId: string, userId: string) {
    const group = await this.model.findById(groupId)
    if (!group) throw new Error('Grupo não encontrado')
    if (group.membros.includes(userId) || group.pendentes.includes(userId)) return group
    group.pendentes.push(userId)
    return group.save()
  }

  async approveMember(groupId: string, userId: string, approverId: string) {
    const group = await this.model.findById(groupId)
    if (!group) throw new NotFoundException('Grupo não encontrado')
    if (!group.administradores.includes(approverId)) throw new ForbiddenException()
    group.pendentes = group.pendentes.filter((id) => id !== userId)
    group.membros.push(userId)
    return group.save()
  }

  async promoteToAdmin(groupId: string, targetId: string, requesterId: string) {
    const group = await this.model.findById(groupId)
    if (!group) throw new NotFoundException('Grupo não encontrado')
    if (!group.administradores.includes(requesterId)) throw new ForbiddenException()
    if (!group.membros.includes(targetId)) throw new Error('Usuário não faz parte do grupo')
    if (!group.administradores.includes(targetId)) group.administradores.push(targetId)
    return group.save()
  }

  async findById(id: string) {
    return this.model.findById(id)
  }

  async getFeed(groupId: string) {
    const group = await this.model.findById(groupId)
    if (!group) throw new Error('Grupo não encontrado')

    return this.activityModel
      .find({ userId: { $in: group.membros } })
      .sort({ data: -1 })
      .lean()
  }

  async getGroupRankings(groupId: string) {
    const group = await this.model.findById(groupId).lean();

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

  async findByAdmin(userId: string) {
    return this.model.find({ administradores: userId })
  }

  async deleteGroup(id: string): Promise<{ message: string }> {
    const result = await this.model.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Grupo não encontrado');
    }
    return { message: 'Grupo excluído com sucesso' };
  }

  async removeMember(groupId: string, userId: string, requesterId: string) {
    const grupo = await this.model.findById(groupId);

    if (!grupo) throw new NotFoundException('Grupo não encontrado');

    // Só admins podem remover
    const isRequesterAdmin = grupo.administradores.includes(requesterId);
    if (!isRequesterAdmin) {
      throw new ForbiddenException('Apenas administradores podem remover membros.');
    }

    // Não pode remover alguém que não está no grupo
    const isMember = grupo.membros.includes(userId);
    if (!isMember) {
      throw new BadRequestException('Usuário não faz parte do grupo.');
    }

    // Remove da lista de membros
    grupo.membros = grupo.membros.filter((id) => id.toString() !== userId);

    // Se por acaso for admin também, remove da lista de admins
    grupo.administradores = grupo.administradores.filter((id) => id.toString() !== userId);

    await grupo.save();

    return { message: 'Membro removido com sucesso.' };
  }

  async leaveGroup(groupId: string, userId: string) {
    const grupo = await this.model.findById(groupId);
    if (!grupo) throw new NotFoundException('Grupo não encontrado');

    const isMember = grupo.membros.includes(userId);
    if (!isMember) throw new BadRequestException('Você não faz parte deste grupo.');

    const isAdmin = grupo.administradores.includes(userId);

    // Bloqueia se for o último admin
    if (isAdmin && grupo.administradores.length === 1) {
      throw new BadRequestException('Você é o único administrador do grupo. Nomeie outro admin antes de sair.');
    }

    // Remove da lista de membros
    grupo.membros = grupo.membros.filter((id) => id.toString() !== userId);

    // Se for admin, remove da lista de admins também
    if (isAdmin) {
      grupo.administradores = grupo.administradores.filter((id) => id.toString() !== userId);
    }

    await grupo.save();

    return { message: 'Você saiu do grupo com sucesso.' };
  }


}
