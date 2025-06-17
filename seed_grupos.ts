import { NestFactory } from '@nestjs/core'
import { AppModule } from './src/app.module'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './src/users/user.schema'
import { Group } from './src/groups/group.schema'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)

  const userModel = app.get<Model<User>>(getModelToken('User'))
  const groupModel = app.get<Model<Group>>(getModelToken('Group'))

  await groupModel.deleteMany({})

  const usuarios = await userModel.find().lean()

  const gruposInfo = [
    {
      nome: 'Corredores da Redenção',
      descricao: 'Grupo focado em treinos na Redenção',
      usuarios: usuarios.slice(0, 5), // usuario1 ao usuario5
    },
    {
      nome: 'Guaíba Runners',
      descricao: 'Corridas na Orla e bairros próximos',
      usuarios: usuarios.slice(5, 10), // usuario6 ao usuario10
    },
    {
      nome: 'Trilha Urbana POA',
      descricao: 'Explorando trilhas urbanas pela cidade',
      usuarios: usuarios.slice(10, 15), // usuario11 ao usuario15
    },
  ]

  for (let i = 0; i < gruposInfo.length; i++) {
    const grupo = gruposInfo[i]
    const admin = grupo.usuarios[0]

    await groupModel.create({
      nome: grupo.nome,
      descricao: grupo.descricao,
      criadorId: admin._id,
      administradores: [admin._id],
      membros: grupo.usuarios.map((u) => u._id),
    })

    console.log(`✅ Grupo "${grupo.nome}" criado com ${grupo.usuarios.length} membros.`)
  }

  console.log('✅ Seed de grupos finalizado.')
  await app.close()
}

bootstrap()
