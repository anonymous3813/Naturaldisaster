import express from 'express'
import {postLocation} from '../controllers/locationController.js'

const router = express.Router()

router.post('/', postLocation)

export default router;