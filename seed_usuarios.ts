import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.seeding' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './src/users/user.schema';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>(getModelToken('User'));

  await userModel.deleteMany({});

  const fotosPredefinidas = [
    "/imgs/corredor1.png", "/imgs/corredor2.png", "/imgs/corredor3.png",
    "/imgs/corredor4.png", "/imgs/corredor5.png", "/imgs/corredor6.png",
    "/imgs/corredor7.png", "/imgs/corredor8.png", "/imgs/corredor9.png",
    "/imgs/corredor10.png", "/imgs/corredor11.png", "/imgs/corredor12.png",
    "/imgs/corredor13.png", "/imgs/corredor14.png", "/imgs/corredor15.png",
    "/imgs/corredor16.png", "/imgs/corredor17.png", "/imgs/corredor18.png",
    "/imgs/corredor19.png", "/imgs/corredor20.png", "/imgs/corredor21.png",
    "/imgs/corredor22.png", "/imgs/corredor23.png", "/imgs/corredor24.png",
    "/imgs/corredor25.png", "/imgs/corredor26.png", "/imgs/corredor27.png",
    "/imgs/corredor28.png", "/imgs/corredor29.png", "/imgs/corredor30.png",
    "/imgs/corredor31.png", "/imgs/corredor32.png",
  ];

  const niveis = ['iniciante', 'intermediário', 'avançado'];
  const estilos = ['pista', 'trilha', 'rua'];

  const nomes = [
    'Carlos Silva', 'Maria Souza', 'Marcos Oliveira', 'Juliana Santos', 'Fernando Costa',
    'Patrícia Lima', 'Ricardo Martins', 'Claudia Rocha', 'Gabriel Almeida', 'Larissa Ribeiro',
    'Thiago Barbosa', 'Camila Ferreira', 'Felipe Cardoso', 'Vanessa Duarte', 'Lucas Moura',
  ];

  const senhaHash = await bcrypt.hash('123456', 10);

  for (let i = 0; i < 15; i++) {
    await userModel.create({
      nome: nomes[i],
      email: `usuario${i + 1}@corridamais.com`,
      senha: senhaHash,
      idade: Math.floor(Math.random() * 69) + 12,
      foto: fotosPredefinidas[Math.floor(Math.random() * fotosPredefinidas.length)],
      nivelExperiencia: niveis[Math.floor(Math.random() * niveis.length)],
      estiloCorrida: estilos[Math.floor(Math.random() * estilos.length)],
      redesSociais: {},
    });
  }

  console.log('✅ Seed de usuários finalizado!');
  await app.close();
  await mongoose.disconnect();
}

bootstrap();