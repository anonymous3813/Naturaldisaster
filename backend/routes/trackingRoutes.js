import express from 'express';
import { respondToUserController, markUserSafeController, getCounterController } from '../controllers/trackingController.js';

const router = express.Router();

router.post('/safe', markUserSafeController);

router.post('/respond', respondToUserController);

router.get('/counter', getCounterController);

export default router;