import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
export const app = express();
app.use(express.json());
app.use(cookieParser());
// Chamada para Rotas
app.use(router);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
