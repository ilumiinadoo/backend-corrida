import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Route, RouteDocument } from '../routes/route.schema';
import { Event, EventDocument } from './event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Route.name) private routeModel: Model<RouteDocument>,
  ) {}

  async create(dto: CreateEventDto, userId: string): Promise<Event> {
    if (dto.rotaAssociada) {
      const rota = await this.routeModel.findById(dto.rotaAssociada);
      if (!rota) throw new Error('Rota associada não encontrada.');
      if (rota.groupId.toString() !== dto.group) {
        throw new Error('A rota associada não pertence ao grupo selecionado.');
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

  async findAllByGroup(groupId: string): Promise<Event[]> {
    return this.eventModel.find({ group: groupId }).populate('rotaAssociada').exec();
  }

  async findFuturosByGroupId(groupId: string) {
    const agora = new Date();
    return this.eventModel.find({
      group: groupId,
      startDate: { $gte: agora },
    })
    .sort({ startDate: 1 }) // Ordena pelo mais próximo
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

  async update(id: string, updateEventDto: UpdateEventDto, userId: string): Promise<Event> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Evento não encontrado');
    if (String(event.createdBy) !== userId) throw new ForbiddenException('Apenas o criador pode editar');
    Object.assign(event, updateEventDto);
    return event.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Evento não encontrado');
    if (String(event.createdBy) !== userId) throw new ForbiddenException('Apenas o criador pode excluir');
    await this.eventModel.deleteOne({ _id: id });
  }

  async confirmAttendance(
    eventId: string,
    userId: string,
    status: 'confirmed' | 'maybe' | 'declined'
  ) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Evento não encontrado');

    const existing = event.attendees.find(a => String(a.user) === userId);
    if (existing) {
      existing.status = status;
    } else {
      event.attendees.push({ user: new Types.ObjectId(userId), status });
    }

    await event.save();
    return event;
  }

}
