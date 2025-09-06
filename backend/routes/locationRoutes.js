import express from 'express'
import {postLocation} from '../controllers/locationController'

const router = express.Router()

router.post('/', postLocation)

export default router;