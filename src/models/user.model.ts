interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;
}

export default User;
