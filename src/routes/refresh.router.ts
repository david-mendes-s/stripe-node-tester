import express from 'express';
import RefreshController from '../controllers/refresh.controller';

const router = express.Router();

router.post('/refresh-token', RefreshController.refreshAccessToken);

export default router;
