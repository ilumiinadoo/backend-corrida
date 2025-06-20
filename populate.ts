import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.seeding' });

import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Conectado ao MongoDB Atlas');

    console.log('\n➡️ Executando seed: Usuários');
    await import('./seed_usuarios');

    console.log('\n➡️ Executando seed: Atividades');
    await import('./seed_atividades');

    console.log('\n➡️ Executando seed: Grupos');
    await import('./seed_grupos');

    console.log('\n➡️ Executando seed: Rotas');
    await import('./seed_rotas');

    console.log('\n➡️ Executando seed: Realizações');
    await import('./seed_realizacoes');

    console.log('\n➡️ Executando seed: Eventos');
    await import('./seed_eventos');

    console.log('\n✅ Todos os seeds executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar os seeds:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Conexão com o banco encerrada');
  }
}

run();
