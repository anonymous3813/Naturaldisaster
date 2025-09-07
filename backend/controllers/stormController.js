import { getStormsWithZones } from '../services/stormService.js';
import { alertUsers } from '../services/notificationService.js';

export const updateStorms = async (req, res) => {
  try {
    const storms = await getStormsWithZones();

    for (const storm of storms) {
      if (storm.priorityQueue && storm.priorityQueue.length > 0) {
        await alertUsers(storm.priorityQueue);
      }
      console.log(`Storm ${storm.name} affected ${storm.priorityQueue?.length || 0} users`);
    }

    res.status(200).json({
      success: true,
      storms
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update storms' });
  }
};
