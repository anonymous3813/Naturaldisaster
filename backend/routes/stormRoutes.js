import express from 'express';
import { updateStorms } from '../controllers/stormController.js';

const router = express.Router();

router.get('/update', updateStorms);

export default router;
