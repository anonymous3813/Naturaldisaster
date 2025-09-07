
import express from 'express';
import { respondToUser, getCounter } from '../controllers/trackingController.js';

const router = express.Router();

router.post('/', async (req, res) => {
    
    await respondToUser(req, res);
    await getCounter(req, res);
});

export default router;
