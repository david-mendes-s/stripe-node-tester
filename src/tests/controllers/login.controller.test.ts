import request from 'supertest';
import {
  createTestPrismaClient,
  setupTestDB,
  teardownTestDB,
} from '../setup-test-db.js';
import { PrismaClient } from '@prisma/client';
import app from '../../app.js';

// -------------------------------------------------------------
// Passo 1: Configuração do Mocking
// -------------------------------------------------------------

// O Jest precisa saber que esta variável será uma instância do PrismaClient.
let mockPrismaClient: PrismaClient | null = null;

// Moca o módulo que exporta o cliente Prisma usado pela sua aplicação.
jest.mock('../../db/db.postgresql.js', () => ({
  prisma: {
    // O mockPrismaClient real será atribuído em beforeAll.
    // Usamos getters para garantir que a propriedade seja acessada APÓS a inicialização.
    get user() {
      // É uma boa prática lançar um erro caso o cliente não esteja pronto
      if (!mockPrismaClient)
        throw new Error('Prisma Client de Mock não inicializado.');
      return mockPrismaClient.user;
    },

    // Adicione outros modelos (e.g., post, product) que seu app usa aqui:
    // get post() {
    //   if (!mockPrismaClient) throw new Error("Prisma Client de Mock não inicializado.");
    //   return mockPrismaClient.post;
    // },

    // MÉTODOS DE UTILIDADE:
    // CORREÇÃO TS7006: Tipando o parâmetro 'query' como string
    $executeRawUnsafe: (query: string) => {
      if (!mockPrismaClient)
        throw new Error('Prisma Client de Mock não inicializado.');
      return mockPrismaClient.$executeRawUnsafe(query);
    },

    $disconnect: () => {
      if (!mockPrismaClient) return;
      return mockPrismaClient.$disconnect();
    },
  },
}));

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => '1'), // id fixo para facilitar o teste
  };
});

// Variável para o cliente de teste, usada para limpar o banco (não usada pelo app)
let testPrismaClient: PrismaClient;
// --- Setup/Teardown para a suite de testes ---

beforeAll(async () => {
  // Configura o DB e obtém a URL
  await setupTestDB();

  // Cria a instância do Prisma conectada ao DB de teste
  const client = createTestPrismaClient();

  // 1. Armazena a instância real para uso nas funções de limpeza do Jest
  testPrismaClient = client;

  // 2. ATRIBUI a instância real para a variável que está sendo mockada.
  // O app agora usará esta instância de teste.
  mockPrismaClient = client;
}, 80000);

afterAll(async () => {
  // Garante que o cliente Prisma se desconecte, liberando o processo
  await testPrismaClient?.$disconnect();
  // Limpa o ambiente do Testcontainers
  await teardownTestDB();
});

describe('Login Controller', () => {
  beforeEach(async () => {
    // ATENÇÃO: Use 'testPrismaClient' para a limpeza do banco de dados.
    // Trunca todas as tabelas para garantir um estado limpo
    await testPrismaClient.$executeRawUnsafe(
      `TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`,
    );
  });

  it('should return 200, an access token, and set a refresh token cookie', async () => {
    // 1. Cria o usuário (Passo necessário para o login)
    await request(app)
      .post('/users')
      .send({ name: 'test', email: 'test@test.com', password: '123456' })
      .expect(201);

    // 2. Tenta o Login e armazena a resposta
    const response = await request(app)
      .post('/login')
      .send({ email: 'test@test.com', password: '123456' })
      .expect(200); // 1. Verifica o status HTTP

    // --- ASSERÇÕES DE QUALIDADE ---

    // 3. Verifica o Corpo da Resposta (Access Token)
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.accessToken).toBeDefined();

    // 4. Verifica o Cabeçalho da Resposta (Refresh Token Cookie)
    // O supertest espera que o cabeçalho 'Set-Cookie' exista e tenha um valor que comece com 'refreshToken='
    expect(response.headers['set-cookie']).toBeDefined();

    // O cabeçalho 'Set-Cookie' é um array ou uma string que contém o cookie completo
    const setCookieHeader = response.headers['set-cookie'];

    // Verifica se pelo menos um dos cookies começa com "refreshToken="
    expect(setCookieHeader).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );

    // Opcional: Você pode verificar as flags de segurança no cookie (HttpOnly, Secure, etc.)
    // O cookie deve conter 'HttpOnly' e 'SameSite=Strict'
    expect(setCookieHeader).toEqual(
      expect.arrayContaining([
        expect.stringContaining('HttpOnly'),
        expect.stringContaining('SameSite=Strict'),
      ]),
    );
  });

  it('should return 400 if the user is invalid', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'test45@test.com', password: '123456' })
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('Email ou senha inválidos.');
  });
});
