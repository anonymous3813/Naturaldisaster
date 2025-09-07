import { getPriorityUsers as getPQUsers } from '../services/locationService.js';
import { getAllUserLocations } from '../services/locationService.js';
import { priorityQueue } from '../services/priorityQueue.js';

export function getPriorityUsers(req, res) {
  try {
    const users = getPQUsers(10); 
    res.json(users);
  } catch (err) {
    console.log(err)
    res.status(500).send('Error fetching priority users');
  }
}

export function updates(req, res) {
    try{
        const {userId, lat, long, danger} = req.body

        if(!userId || !lat || !long) {
            return res.status(400).json({error: "Missing required fields"})
        }

        priorityQueue.push({userId, lat, long, danger: danger || 0})

        res.json({success: true, message: "PQ updated"})
    } catch(err) {
        console.log(err)
        res.status(500).send("Error updating PQ")
    }
}

export async function snapshot(req, res) {
    try {
        const users = await Prisma.getAllUserLocations()
        res.json(users)
    } catch(err) {
        console.log(err)
        res.status(500).end("Error etching snapshot")
    }

}
