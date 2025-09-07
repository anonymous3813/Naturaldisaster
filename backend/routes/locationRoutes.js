import express from 'express'
import {postLocation, getAllLocations, exportLocationsCSV} from '../controllers/locationController.js'

const router = express.Router()

router.post('/post', postLocation)
router.get('/get', getAllLocations)
router.get('/export-csv', exportLocationsCSV)

export default router;