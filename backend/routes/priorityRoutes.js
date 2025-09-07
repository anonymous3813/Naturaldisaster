import express from 'express'
import {getPriorityUsers, snapshot, updates} from '../controllers/priorityController.js'

const router = express.Router()

router.post('/', getPriorityUsers)
router.post('/', snapshot)
router.post('/', updates)


export default router;