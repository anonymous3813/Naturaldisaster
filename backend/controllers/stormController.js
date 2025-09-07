import { getStormsWithZones } from '../services/stormService.js';
import { flagUsersInStorm, buildPriorityQueue, alertUsers } from '../services/priorityQueue.js';

export const updateStorms = async (req, res) => {
  try {
   
    const storms = await getStormsWithZones();

    
    for (const storm of storms) {
      const affectedUsers = await flagUsersInStorm(storm);
      const pq = buildPriorityQueue(affectedUsers);

      
      await alertUsers(affectedUsers);

      
      console.log(`Storm ${storm.title} affected ${affectedUsers.length} users`);
    }

    res.json({ success: true, storms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update storms' });
  }
};
