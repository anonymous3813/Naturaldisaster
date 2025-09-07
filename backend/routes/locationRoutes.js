import express from 'express'
import {postLocation, getAllLocations} from '../controllers/locationController.js'

const router = express.Router()

router.post('/post', postLocation)
router.get('/get', getAllLocations)

export default router;