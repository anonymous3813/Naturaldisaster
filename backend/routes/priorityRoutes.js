import express from 'express';
import { getPriorityUsers } from '../controllers/priorityController.js';

const router = express.Router();

router.post('/', getPriorityUsers);

export default router;
