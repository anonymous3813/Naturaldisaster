import {saveUserLocation} from '../services/locationService.js'
import { getAllUserLocations } from '../services/locationService.js'
export async function postLocation(req, res) {
    try {
        const {userId, lat, lon} = req.body;
        if (!userId || !lat || !lon) {
            return res.status(400).json({error: "Need all data to continue"})
        }

        await saveUserLocation(userId, lat, lon)
        return res.status(200).json({message: 'location updated'})

    }
    catch (err) {
        console.log(err)
        res.status(500).json({error: "internal software error"})

    }
}

export async function getAllLocations(req, res) {
    try {
        const users = await getAllUserLocations()
        res.status(200).json(users)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "internal server error" })
    }
}