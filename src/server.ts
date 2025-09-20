import express from 'express';
import router from './routes/router';

export const app = express();

app.use(express.json());

// Chamada para Rotas
app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
