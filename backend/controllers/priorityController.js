import { flagUsersInStorm, buildPriorityQueue, getDistance, alertUsers } from '../services/priorityQueue.js';

export const getPriorityUsers = async (req, res) => {
  try {
    const storm = req.body; 
    const affectedUsers = await flagUsersInStorm(storm);

    const usersWithDistance = affectedUsers.map(user => ({
      ...user,
      distance: getDistance(storm.lat, storm.lon, user.lat, user.lon)
    }));

    const pq = buildPriorityQueue(usersWithDistance);

    await alertUsers(usersWithDistance);

    res.json({ priorityQueue: pq.toArray(), affectedUsers: usersWithDistance.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate priority' });
  }
};
