import { Controller, Get } from '@nestjs/common';

@Controller('runs')
export class RunController {
  @Get()
  getRuns() {
    return [
      {
        id: '1',
        nome: '3ª Meia Maratona Internacional de Guarulhos',
        data: '2025-07-27',
        local: 'Guarulhos - SP',
        link: 'https://www.yescom.com.br/meiamaratonadeguarulhos/2025/index.asp',
      },
      {
        id: '2',
        nome: 'Circuito das Estações – Inverno (5/10 km) – São Paulo',
        data: '2025-06-29',
        local: 'São Paulo - SP',
        link: 'https://www.circuitodasestacoes.com.br/sao-paulo/inverno/',
      },
      {
        id: '3',
        nome: 'Circuito das Estações – Inverno (5/10 km) – São Luís',
        data: '2025-06-15',
        local: 'São Luís - MA',
        link: 'https://www.corridinhas.com.br/race/0aeade78-e158-42f6-b6b0-eda454e3559d',
      },
      {
        id: '4',
        nome: '27ª Meia Maratona Internacional do Rio',
        data: '2025-08-17',
        local: 'Rio de Janeiro - RJ',
        link: 'https://www.yescom.com.br/meiadorio/2025/index.asp',
      },
      {
        id: '5',
        nome: '26ª Volta Internacional da Pampulha',
        data: '2025-07-12',
        local: 'Belo Horizonte - MG',
        link: 'https://www.yescom.com.br/voltadapampulha/2025/index.asp',
      },
      {
        id: '6',
        nome: 'Circuito das Estações – Inverno (5/10 km) – João Pessoa',
        data: '2025-07-06',
        local: 'João Pessoa - PB',
        link: 'https://www.ativo.com/calendario/eventos/america-do-sul/br/pb/cabedelo/corrida-de-rua/39608/circuito-das-estacoes-2025-inverno-joao-pessoa/',
      },
      {
        id: '7',
        nome: 'Corrida Barro Branco – 10 km',
        data: '2025-08-24',
        local: 'São Paulo - SP',
        link: 'https://www.yescom.com.br/corridabarrobranco/2025/index.asp',
      },
      {
        id: '8',
        nome: 'Circuito das Estações – Verão (5/10/21 km) – São Paulo',
        data: '2025-12-14',
        local: 'São Paulo - SP',
        link: 'https://www.circuitodasestacoes.com.br/sao-paulo/verao/',
      },
      {
        id: '9',
        nome: 'Maratona Internacional de Florianópolis',
        data: '2025-08-31',
        local: 'Florianópolis - SC',
        link: 'https://maratonafloripa.com.br/',
      },
      {
        id: '10',
        nome: 'Maratona de Torres',
        data: '2025-03-16',
        local: 'Torres - RS',
        link: 'https://corridasderuars.com.br/evento/1a-maratona-de-torres/',
      },
      {
        id: '15',
        nome: 'Circuito das Estações – Primavera (5/10 km) – São Paulo',
        data: '2025-09-07',
        local: 'São Paulo - SP',
        link: 'https://www.circuitodasestacoes.com.br/sao-paulo/primavera/',
      },
      {
        id: '12',
        nome: 'Maratona Internacional de Pomerode',
        data: '2025-10-25',
        local: 'Pomerode - SC',
        link: 'https://www.catarinarun.com.br/evento/maratona-internacional-de-pomerode-2025',
      },
      {
        id: '13',
        nome: 'Maratona de Curitiba',
        data: '2025-11-23',
        local: 'Curitiba - PR',
        link: 'https://maratonadecuritiba.com.br/',
      },
      {
        id: '14',
        nome: 'Volta Internacional da Pampulha',
        data: '2025-12-07',
        local: 'Belo Horizonte - MG',
        link: 'https://www.yescom.com.br/voltadapampulha/2025/index.asp',
      },
    ];
  }
}
