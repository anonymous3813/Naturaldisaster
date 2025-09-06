import express from 'express'
import getStorm from '../controllers/stormController'
import snapshot from '../controllers/stormController'

const router = express.Router()

router.post('/', getStorm)
router.post('/', snapshot)

export default router;