import express from 'express'
import {getStorms} from '../controllers/stormController.js'
import {getSnapshot} from '../controllers/stormController.js'

const router = express.Router()

router.post('/', getStorms)
router.post('/snapshot', getSnapshot)

export default router;