import request from 'supertest';
import app from '../../app.js';

import {
  createTestPrismaClient,
  setupTestDB,
  teardownTestDB,
} from '../setup-test-db.js';
import { PrismaClient } from '@prisma/client';
// Importe o seu serviço ou controller que você está testando

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => '1'), // id fixo para facilitar o teste
  };
});

let prisma: PrismaClient;
// --- Setup/Teardown para a suite de testes ---

beforeAll(async () => {
  // Configura o DB e obtém a URL
  await setupTestDB();
  // Cria a instância do Prisma conectada ao DB de teste
  prisma = createTestPrismaClient();
}, 80000);

afterAll(async () => {
  // 1. Garante que o cliente Prisma se desconecte, liberando o processo
  await prisma?.$disconnect();
  // Limpa o ambiente do Testcontainers
  await teardownTestDB();
});

describe('Create User Controller', () => {
  // Opcional: Limpar dados entre cada teste (boa prática)
  // Dependendo do volume de dados, pode-se usar transações aninhadas (se suportado)
  beforeEach(async () => {
    // Trunca todas as tabelas para garantir um estado limpo
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`,
    );
  });

  it('created user with router post', () => {
    request(app)
      .post('/users')
      .send({
        name: 'David',
        email: 'david1@gmail.com',
        password: 'qwe123',
      })
      .expect(201);
  });
});
