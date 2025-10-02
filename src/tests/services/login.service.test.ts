import { db } from '../../repositories/users/memory.user.repository.js';
import LoginService from '../../services/login.service.js';
import UserService from '../../services/user.service.js';

// Isso substitui o conteúdo real do arquivo de configuração para os testes.
jest.mock('../../config/auth.config.js', () => ({
  jwtSecret: 'TEST_SECRET_KEY',
}));

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => '1'), // id fixo para facilitar o teste
  };
});

describe('Login Service', () => {
  let loginService: LoginService;
  let userService: UserService;

  beforeEach(() => {
    loginService = new LoginService(db);
    userService = new UserService(db);
  });

  beforeEach(() => {
    // Clear the database before each test
    db.clear();
  });

  it('should return a token if the user is valid', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'test@test.com',
      password: '123456',
    };
    await userService.createUser(user);

    const token = await loginService.login({
      email: 'test@test.com',
      password: '123456',
    });
    expect(token).toBeDefined();
  });

  it('should return an error if the user is invalid', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'testtt@test.com',
      password: '123456',
    };
    await userService.createUser(user);

    await expect(
      loginService.login({ email: 'test@test.com', password: '123456' }),
    ).rejects.toThrow('Email ou senha inválidos.');
  });
});
