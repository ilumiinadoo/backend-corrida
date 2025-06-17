import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Route, RouteDocument } from './route.schema';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from '../groups/group.schema';

@Injectable()
export class RouteService {
  constructor(
    @InjectModel(Route.name) private routeModel: Model<RouteDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>
  ) {}

  /**
   * Cria uma nova rota vinculada a um grupo.
   * Converte coordenadas no formato [{lat, lng}] para [[lat, lng]].
   */
  async createRoute(data: {
    nome: string;
    descricao?: string;
    groupId: string;
    pontoInicio: string;
    pontoFim: string;
    distanciaKm: number;
    coordenadas: { lat: number; lng: number }[];
    criadoPor: string;
  }) {
    // 🔎 Verifica se o grupo existe
    const group = await this.groupModel.findById(data.groupId);
    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    // 🧪 Valida se há coordenadas
    if (!data.coordenadas || data.coordenadas.length === 0) {
      throw new Error('A rota precisa conter pelo menos uma coordenada.');
    }

    const coordenadasArray = data.coordenadas; // ✅ correto, já está no formato { lat, lng }

    // 🎯 Define ponto de partida e chegada com validação contra undefined
    const primeira = data.coordenadas[0];
    const ultima = data.coordenadas.at(-1);

    const partida = primeira ? [primeira.lat, primeira.lng] : null;
    const chegada = ultima ? [ultima.lat, ultima.lng] : null;



    // 📦 Cria e salva a nova rota
    const rota = new this.routeModel({
      nome: data.nome,
      descricao: data.descricao,
      groupId: data.groupId,
      pontoInicio: data.pontoInicio,
      pontoFim: data.pontoFim,
      distanciaKm: data.distanciaKm,
      coordenadas: coordenadasArray,
      partida,
      chegada,
      criadoPor: data.criadoPor,
      criadoEm: new Date(),
    });

    return rota.save();
  }

  /**
   * Retorna todas as rotas associadas aos grupos dos quais o usuário participa.
   */
  async findRoutesForUser(userId: string) {
    const grupos = await this.groupModel.find({ membros: userId });
    const groupIds = grupos.map((g) => g._id);
    return this.routeModel.find({ groupId: { $in: groupIds } });
  }

  /**
   * Retorna as rotas de um grupo específico.
   */
  async findByGroup(groupId: string) {
    if (!Types.ObjectId.isValid(groupId)) {
      throw new Error('ID de grupo inválido');
    }
    return this.routeModel.find({ groupId: new Types.ObjectId(groupId) });
  }

  /**
   * Retorna uma rota específica pelo seu ID.
   */
  async findById(id: string): Promise<Route> {
    
    const route = await this.routeModel.findById(id);
    
    if (!route) throw new NotFoundException('Rota não encontrada');
    return route;
  }

  /**
   * Exclui uma rota com base no ID.
   */
  async deleteRoute(routeId: string, userId: string) {
    if (!Types.ObjectId.isValid(routeId)) {
      throw new NotFoundException('ID inválido para rota');
    }
    const result = await this.routeModel.findByIdAndDelete(routeId);
    if (!result) {
      throw new NotFoundException('Rota não encontrada para exclusão');
    }
    
    return { message: 'Rota excluída com sucesso' };
  }
}
