import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Accomplishment } from './accomplishment.schema';
import { CreateAccomplishmentDto } from './dto/create-accomplishment.dto';
import { Route } from '../routes/route.schema';
import { Group } from '../groups/group.schema';

@Injectable()
export class AccomplishmentService {
  constructor(
    @InjectModel(Accomplishment.name) private accomplishmentModel: Model<Accomplishment>,
    @InjectModel(Route.name) private routeModel: Model<Route>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
  ) {}

  async criar(dto: CreateAccomplishmentDto, usuarioId: string) {
    const rota = await this.routeModel.findById(dto.rotaId);
    if (!rota) throw new NotFoundException('Rota não encontrada');

    const grupo = await this.groupModel.findById(rota.groupId);
    if (!grupo) throw new NotFoundException('Grupo não encontrado');

    const ehMembro = grupo.membros.some(
      (membroId) => membroId.toString() === usuarioId,
    );

    if (!ehMembro) {
      throw new ForbiddenException('Você não é membro deste grupo');
    }

    const tempoTotalMinutos =
      dto.horas * 60 + dto.minutos + dto.segundos / 60;

    const ritmoMedio = tempoTotalMinutos / rota.distanciaKm;

    const partes = dto.data.split('-'); // Ex: ['2025', '06', '16']
      const dataFinal = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2]),
      );

    const accomplishment = new this.accomplishmentModel({
      rotaId: dto.rotaId,
      usuarioId,
      grupoId: rota.groupId, 
      data: dataFinal,
      tempo: {
        horas: dto.horas,
        minutos: dto.minutos,
        segundos: dto.segundos,
      },
      ritmoMedio,
      avaliacao: dto.avaliacao,
      comentario: dto.comentario,
    });

    return await accomplishment.save();
  }

  async listarPorRota(rotaId: string) {
    return this.accomplishmentModel.find({ rotaId }).sort({ data: -1 });
  }
}
