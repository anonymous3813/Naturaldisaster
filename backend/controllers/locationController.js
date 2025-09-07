import {saveUserLocation} from '../services/locationService.js'

export async function postLocation(req, res) {
    try {
        const {userId, lat, long} = req.body;
        if (!userId || !lat || !long) {
            return res.status(400).json({error: "Need all data to continue"})
        }

        await saveUserLocation(userId, lat, long)
        return res.status(200).json({message: 'location updated'})

    }
    catch (err) {
        onslotchange.log(err)
        res.status(500).json({error: "internal software error"})

    }
}