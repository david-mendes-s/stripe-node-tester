import express from 'express';
import RefreshController from '../controllers/refresh.controller.js';
const router = express.Router();
router.post('/refresh-token', RefreshController.refreshAccessToken);
export default router;
