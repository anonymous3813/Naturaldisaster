import express from 'express';
import { respondToUser, markUserSafe, getCounter } from '../controllers/trackingController.js';

const router = express.Router();


router.post('/safe', markUserSafe);


router.post('/respond', respondToUser);


router.get('/counter', getCounter);

export default router;