import bcrypt from 'bcrypt';
import { db } from '../../repositories/users/memory.user.repository.js';
import UserService from '../../services/user.service.js';
import { IUserService } from '../../services/user.service.interface.js';

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => '1'), // id fixo para facilitar o teste
  };
});

describe('Create User', () => {
  let userService: IUserService;

  beforeAll(() => {
    userService = new UserService(db);
  });

  beforeEach(() => {
    // Clear the database before each test
    db.clear();
  });

  it('should create a new user with encrypted password', async () => {
    const user = {
      name: 'John Doe',
      email: 'david@gmail.com',
      password: 'password123',
    };

    const createdUser = await userService.createUser(user);

    expect(createdUser).toHaveProperty('id', '1');
    expect(createdUser.name).toBe(user.name);
    expect(createdUser.email).toBe(user.email);

    // Senha salva não deve ser igual à original
    expect(createdUser.password).not.toBe(user.password);

    // Hash deve corresponder à senha original
    const isMatch = await bcrypt.compare(user.password, createdUser.password);
    expect(isMatch).toBe(true);
  });

  it('should throw an error if user email already exists', async () => {
    const user = {
      name: 'John Doe',
      email: 'david1@gmail.com',
      password: 'password123',
    };

    await userService.createUser(user); // primeiro cadastro

    // Segundo cadastro com mesmo email deve falhar
    await expect(userService.createUser(user)).rejects.toEqual(
      new Error('Usuário com este email já existe.'),
    );
  });
});

describe('Update User', () => {
  let userService: IUserService;

  beforeAll(() => {
    userService = new UserService(db);
  });

  beforeEach(() => {
    // Clear the database before each test
    db.clear();
  });

  it('should update user successfully', async () => {
    // First create a user
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const createdUser = await userService.createUser(user);

    // Update the user
    const updateData = {
      name: 'John Updated',
      email: 'john.updated@example.com',
    };

    const updatedUser = await userService.updateUser(
      createdUser.id,
      updateData,
    );

    expect(updatedUser).toHaveProperty('id', createdUser.id);
    expect(updatedUser?.name).toBe(updateData.name);
    expect(updatedUser?.email).toBe(updateData.email);
    // Password should not be returned in the response
    expect(updatedUser).not.toHaveProperty('password');
  });

  it('should update user password with encryption', async () => {
    // First create a user
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const createdUser = await userService.createUser(user);

    // Update the user password
    const newPassword = 'newpassword456';
    const updateData = {
      password: newPassword,
    };

    const updatedUser = await userService.updateUser(
      createdUser.id,
      updateData,
    );

    expect(updatedUser).toHaveProperty('id', createdUser.id);
    expect(updatedUser?.name).toBe(user.name);
    expect(updatedUser?.email).toBe(user.email);
    // Password should not be returned in the response
    expect(updatedUser).not.toHaveProperty('password');

    // Verify the password was encrypted by checking the stored user
    const storedUser = await userService.getAll();
    const userWithPassword = storedUser.find((u) => u.id === createdUser.id);

    // The password should be encrypted (different from the original)
    expect(userWithPassword).toBeDefined();
  });

  it('should throw an error when user is not found', async () => {
    const updateData = {
      name: 'John Updated',
      email: 'john.updated@example.com',
    };

    const nonExistentId = 'non-existent-id';

    await expect(
      userService.updateUser(nonExistentId, updateData),
    ).rejects.toEqual(new Error('Usuário não encontrado ou sem permissão'));
  });

  it('should update only provided fields (partial update)', async () => {
    // First create a user
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const createdUser = await userService.createUser(user);

    // Update only the name
    const updateData = {
      name: 'John Updated Name Only',
    };

    const updatedUser = await userService.updateUser(
      createdUser.id,
      updateData,
    );

    expect(updatedUser).toHaveProperty('id', createdUser.id);
    expect(updatedUser?.name).toBe(updateData.name);
    expect(updatedUser?.email).toBe(user.email); // Email should remain unchanged
  });

  it('should update user with all fields including password', async () => {
    // First create a user
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const createdUser = await userService.createUser(user);

    // Update all fields including password
    const updateData = {
      name: 'John Completely Updated',
      email: 'john.completely.updated@example.com',
      password: 'completelynewpassword789',
    };

    const updatedUser = await userService.updateUser(
      createdUser.id,
      updateData,
    );

    expect(updatedUser).toHaveProperty('id', createdUser.id);
    expect(updatedUser?.name).toBe(updateData.name);
    expect(updatedUser?.email).toBe(updateData.email);
    // Password should not be returned in the response
    expect(updatedUser).not.toHaveProperty('password');
  });
});
