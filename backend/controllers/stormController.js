import { getStormsWithZones } from '../services/stormService.js';
import { getAllUserLocations } from '../services/locationService.js';

export async function getStorms(req, res) {
  try {
    const storms = await getStormsWithZones();
    res.json(storms);
  } catch (err) {
    res.status(500).send('Error fetching storms');
  }
}

export async function getSnapshot(req, res) {
  try {
    const users = await getAllUserLocations();
    res.json(users);
  } catch (err) {
    res.status(500).send('Error fetching snapshot');
  }
}
