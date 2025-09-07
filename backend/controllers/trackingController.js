import { markUserSafe, getRescueStats } from '../services/trackingService.js';

export const respondToUser = async (req, res) => {
  try {
    const { responderId, userId, responderLat, responderLon } = req.body;
    const success = await markUserSafe(responderId, userId, responderLat, responderLon);
    res.json({ success });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getCounter = async (req, res) => {
  try {
    const stats = await getRescueStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
