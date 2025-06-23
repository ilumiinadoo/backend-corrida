import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Route, RouteDocument } from '../routes/route.schema';
import { Event, EventDocument } from './event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { Group, GroupDocument } from '../groups/group.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Route.name) private routeModel: Model<RouteDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  // ============================
  // Criação de Evento
  // ============================

  async create(dto: CreateEventDto, userId: string): Promise<Event> {
    if (dto.rotaAssociada) {
      const rota = await this.routeModel.findById(dto.rotaAssociada);
      if (!rota) throw new BadRequestException('Rota associada não encontrada.');
      if (rota.groupId.toString() !== dto.group) {
        throw new BadRequestException('A rota associada não pertence ao grupo selecionado.');
      }
    }

    const novoEvento = new this.eventModel({
      ...dto,
      createdBy: userId,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      attendees: [],
    });

    return await novoEvento.save();
  }

  // ============================
  // Listagens
  // ============================

  async findAllByGroup(groupId: string): Promise<Event[]> {
    return this.eventModel.find({ group: groupId }).populate('rotaAssociada').exec();
  }

  async findFuturosByGroupId(groupId: string) {
    const agora = new Date();
    return this.eventModel.find({
      group: groupId,
      startDate: { $gte: agora },
    })
    .sort({ startDate: 1 })
    .lean();
  }

  async findOne(id: string): Promise<Event> {
    const evento = await this.eventModel
      .findById(id)
      .populate('createdBy', 'nome')
      .populate('rotaAssociada', 'nome coordenadas')
      .populate('attendees.user', 'nome');

    if (!evento) throw new NotFoundException('Evento não encontrado');
    return evento;
  }

  // ============================
  // Exclusão de Evento
  // ============================

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Evento não encontrado');

    const group = await this.groupModel.findById(event.group);
    if (!group) throw new NotFoundException('Grupo não encontrado');

    if (!group.administradores.includes(userId)) {
      throw new ForbiddenException('Apenas administradores podem excluir eventos.');
    }

    await event.deleteOne();
    return { message: 'Evento excluído com sucesso.' };
  }

  // ============================
  // Confirmação de Presença
  // ============================

  async confirmAttendance(
    eventId: string,
    userId: string,
    status: 'confirmed' | 'maybe' | 'declined'
  ) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Evento não encontrado');

    const existing = event.attendees.find((a) => String(a.user) === userId);
    if (existing) {
      existing.status = status;
    } else {
      event.attendees.push({ user: new Types.ObjectId(userId), status });
    }

    await event.save();
    return event;
  }
}
