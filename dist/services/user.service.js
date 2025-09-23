import { db } from '../db/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcript from 'bcrypt';
class UserService {
    static async createUser({ name, email, password }) {
        const hashPassword = await bcript.hash(password, 10);
        await db.create({ id: uuidv4(), name, email, password: hashPassword });
    }
    static async getAll() {
        const users = db.read();
        const usersJson = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
        }));
        return usersJson;
    }
}
export default UserService;
