import { markUserSafe, respondToUser, getRescueStats } from '../services/trackingService.js';

// POST /api/tracking/safe
export const markUserSafeController = async (req, res) => {
  try {
    const { responderId, userId, responderLat, responderLon } = req.body;
    const success = await markUserSafe(responderId, userId, responderLat, responderLon);
    res.json({ success });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tracking/respond
export const respondToUserController = async (req, res) => {
  try {
    const { responderId, userId, responderLat, responderLon } = req.body;
    const success = await respondToUser(responderId, userId, responderLat, responderLon);
    res.json({ success });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tracking/counter
export const getCounterController = async (req, res) => {
  try {
    const stats = await getRescueStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
