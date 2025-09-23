import { db } from '../db/db';
import UserService from '../services/user.service';
class UserController {
    static async createUser(req, res) {
        try {
            const { name, email, password } = req.body;
            // Validação básica no Controller
            if (!name || !email || !password) {
                return res
                    .status(400)
                    .json({ error: 'Nome, email e senha são obrigatórios' });
            }
            if (db.filterUser(email)) {
                return res.sendStatus(409);
            }
            const user = await UserService.createUser({ name, email, password });
            return res.status(201).json(user);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
            return res.status(500).json({ error: errorMessage });
        }
    }
    static async getUsers(req, res) {
        try {
            const users = await UserService.getAll();
            return res.status(200).json(users);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
            return res.status(500).json({ error: errorMessage });
        }
    }
}
export default UserController;
