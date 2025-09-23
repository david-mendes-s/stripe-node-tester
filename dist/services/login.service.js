import jwt from 'jsonwebtoken';
import bcript from 'bcrypt';
import { jwtSecret } from '../config/auth.config.js';
import { db } from '../db/db.js';
class LoginService {
    static async login({ email, password }) {
        const user = await db.filterUser(email);
        if (!user) {
            throw new Error('User not found');
        }
        const match = await bcript.compare(password, user.password);
        if (!match) {
            throw new Error('Invalid password');
        }
        // Gera o Token de Acesso (curta duração)
        const accessToken = jwt.sign({ id: user.id, username: user.name }, jwtSecret, { expiresIn: '15m' });
        // Gera o Refresh Token (longa duração)
        const refreshToken = jwt.sign({ id: user.id }, // O Refresh Token geralmente contém menos informações
        jwtSecret, { expiresIn: '1d' });
        return { accessToken, refreshToken };
    }
}
export default LoginService;
