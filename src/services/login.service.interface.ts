// src/services/login.service.interface.ts

interface ILoginPayload {
  email: string;
  password: string;
}

interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginService {
  login(payload: ILoginPayload): Promise<ILoginResponse>;
}
