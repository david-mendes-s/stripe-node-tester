import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Variáveis globais para acessar o contêiner e o cliente em todo o teste
let container: StartedPostgreSqlContainer;
let testDatabaseUrl: string;

// Função para ser chamada antes de todos os testes (ex: no beforeAll)
export async function setupTestDB() {
  console.log('🟡 Iniciando o contêiner do Testcontainers...');

  // 1. Inicia o contêiner
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withExposedPorts(container?.getMappedPort(5432) || 5432)
    .start();

  // 2. Obtém a URL de conexão dinâmica
  // O Testcontainers cuida de criar um banco de dados temporário com credenciais
  testDatabaseUrl = container.getConnectionUri();
  console.log('🟢 Contêiner iniciado. URL do banco de teste:', testDatabaseUrl);

  // 3. Executa as migrações do Prisma (usando a URL do banco de testes)
  // Usar 'migrate deploy' é o ideal para testes
  console.log('🟡 Aplicando as migrações do Prisma...');
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl, // Injeta a URL do contêiner
    },
    stdio: 'inherit', // Para ver a saída do Prisma
  });

  console.log('🟢 Banco de dados de teste pronto!');
  return testDatabaseUrl;
}

// Função para ser chamada depois de todos os testes (ex: no afterAll)
export async function teardownTestDB() {
  if (container) {
    console.log('🔴 Parando o contêiner do Testcontainers...');
    await container.stop();
    console.log('🔴 Contêiner parado e recursos limpos.');
  }
}

/**
 * Função para criar uma nova instância do PrismaClient conectada ao DB de teste.
 * É recomendável criar uma nova instância para cada suite/teste para maior isolamento.
 */
export function createTestPrismaClient(): PrismaClient {
  if (!testDatabaseUrl) {
    throw new Error(
      "O banco de dados de teste não foi configurado. Garanta que 'setupTestDB' rodou.",
    );
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  });
}
