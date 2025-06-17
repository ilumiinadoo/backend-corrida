import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import axios from 'axios';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name)
    private activityModel: Model<ActivityDocument>,
  ) {}

  async create(userId: string, dto: CreateActivityDto): Promise<Activity> {
    let distanciaKm = dto.distanciaKm;
    let coordenadas = dto.coordenadas;
    let elevacao = dto.elevacao;

    // Se o usuário informar início e fim
    if (dto.pontoInicio && dto.pontoFim && dto.coordenadas?.length === 2) {
      const routeData = await this.calcularRotaEntrePontos(dto.coordenadas[0], dto.coordenadas[1]);
      distanciaKm = routeData.distanciaKm;
      coordenadas = routeData.coordenadas;
      elevacao = routeData.elevacao;
    }


    const ritmoMedio = dto.tempoMinutos / distanciaKm;
    const calorias = distanciaKm * 60;

    // Corrigindo o fuso da data    
    const dataCorrigida = new Date(dto.data);
    dataCorrigida.setUTCHours(12); // Coloca no meio do dia para evitar problemas de fuso na visualização futura

    const novaAtividade = new this.activityModel({
      usuarioId: userId,
      distanciaKm,
      tempoMinutos: dto.tempoMinutos,
      ritmoMedio,
      calorias,
      elevacao,
      pontoInicio: dto.pontoInicio,
      pontoFim: dto.pontoFim,
      coordenadas,
      data: dataCorrigida,
    });

    return novaAtividade.save();
  }

  async calcularRotaEntrePontos(
    inicio: { lat: number; lng: number },
    fim: { lat: number; lng: number },
  ): Promise<{
    distanciaKm: number;
    coordenadas: { lat: number; lng: number }[];
    elevacao: number;
  }> {
    const apiKey = '5b3ce3597851110001cf624801f8288f2e4a4754a0a717d539980f65';

    console.log('Coordenadas recebidas para cálculo de rota:', inicio, fim);

    // 1. Validação das coordenadas recebidas
    if (
      !inicio || !fim ||
      inicio.lat == null || inicio.lng == null ||
      fim.lat == null || fim.lng == null
    ) {
      console.error('Coordenadas inválidas:', { inicio, fim });
      throw new Error('Coordenadas inválidas para cálculo de rota.');
    }

    try {
      // Chamada para o ORS Directions
      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
        {
          coordinates: [
            [inicio.lng, inicio.lat],
            [fim.lng, fim.lat],
          ],
        },
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const geojson = response.data as any;

      // 2. Validação do retorno da ORS
      // Validar que geometry existe
      if (!geojson.features[0].geometry || !geojson.features[0].geometry.coordinates) {
        console.error('GeoJSON sem geometry:', geojson.features[0]);
        throw new Error('Resposta do ORS sem geometry válida.');
      }      

      const distanciaMetros = geojson.features[0].properties.summary.distance;
      const distanciaKm = distanciaMetros / 1000;

      console.error('Resposta ORS completa:', JSON.stringify(geojson, null, 2));

      // 3. Conversão das coordenadas da rota
      const coordenadasRota: { lat: number; lng: number }[] =
        geojson.features[0].geometry.coordinates.map(
          (ponto: [number, number]) => ({
            lat: ponto[1],
            lng: ponto[0],
          }),
        );

      if (!Array.isArray(coordenadasRota) || coordenadasRota.length < 2) {
        console.error('Coordenadas de rota insuficientes:', coordenadasRota);
        throw new Error('Rota calculada não possui pontos suficientes.');
      }

      //console.log('Geometry que será enviada para o elevation:', JSON.stringify(geojson.features[0].geometry, null, 2));

      // Chamada para o ORS Elevation (opcional)
      let elevacao = 0;
      /* Função Elevação deixada para posteriormente
      try {
        const elevResponse = await axios.post(
        'https://api.openrouteservice.org/v2/elevation/line/json',
        {
          format_in: 'geojson',
          geometry: {
            type: 'LineString',
            coordinates: geojson.features[0].geometry.coordinates,
          },
        },
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

        // Novo formato esperado na resposta:
        const summary = (elevResponse.data as any).summary;
        if (summary && summary.ascent != null) {
          elevacao = summary.ascent;
        } else {
          console.warn('ORS Elevation API retornou sem summary:', elevResponse.data);
        }
      } catch (error) {
        console.error('Erro ao consultar elevação:', error.response?.data || error.message);
      }*/

      console.log('Rota calculada com sucesso:', {
        distanciaKm,
        totalPontos: coordenadasRota.length,
        elevacao,
      });

      return {
        distanciaKm,
        coordenadas: coordenadasRota,
        elevacao,
      };
    } catch (error) {
      console.error('Erro ao calcular rota no ORS:', error.response?.data || error.message);
      throw new Error('Erro ao calcular rota entre os pontos informados');
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.activityModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async findByUser(userId: string): Promise<Activity[]> {
    return this.activityModel.find({ usuarioId: userId }).exec();
  }

  async findAllByUser(userId: string): Promise<Activity[]> {
    return this.activityModel.find({ usuarioId: userId }).sort({ data: -1 }).exec();
  }
}
