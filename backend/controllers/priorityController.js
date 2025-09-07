import { flagUsersInStorm, alertUsers, priorityQueue } from '../services/priorityQueue.js';

export const getPriorityUsers = async (req, res) => {
  try {
    const { impactZones } = req.body; 

    const affectedUsers = await flagUsersInStorm(impactZones);

    await alertUsers(affectedUsers);

    res.json({ 
      priorityQueue: priorityQueue.toArray(), 
      affectedCount: affectedUsers.length 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate priority' });
  }
};
