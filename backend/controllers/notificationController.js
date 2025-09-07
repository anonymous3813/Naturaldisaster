import { 
  createAlert, 
  createSOSAlert, 
  createStormAlert, 
  createRescueAlert, 
  createSafeAlert,
  createEvacuationAlert,
  createAllClearAlert,
  sendBulkNotifications,
  getUserAlerts,
  markAlertAsRead,
  registerDeviceToken
} from '../services/notificationService.js';

export async function createAlertController(req, res) {
  try {
    const { userId, message, alertType } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    await createAlert(userId, message, alertType);
    res.status(200).json({ message: 'Alert created successfully' });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
}

export async function createSOSAlertController(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await createSOSAlert(userId);
    res.status(200).json({ message: 'SOS alert created successfully' });
  } catch (error) {
    console.error('Error creating SOS alert:', error);
    res.status(500).json({ error: 'Failed to create SOS alert' });
  }
}

export async function createStormAlertController(req, res) {
  try {
    const { userId, stormName, severity } = req.body;
    
    if (!userId || !stormName || !severity) {
      return res.status(400).json({ error: 'userId, stormName, and severity are required' });
    }

    await createStormAlert(userId, stormName, severity);
    res.status(200).json({ message: 'Storm alert created successfully' });
  } catch (error) {
    console.error('Error creating storm alert:', error);
    res.status(500).json({ error: 'Failed to create storm alert' });
  }
}

export async function createRescueAlertController(req, res) {
  try {
    const { userId, responderId } = req.body;
    
    if (!userId || !responderId) {
      return res.status(400).json({ error: 'userId and responderId are required' });
    }

    await createRescueAlert(userId, responderId);
    res.status(200).json({ message: 'Rescue alert created successfully' });
  } catch (error) {
    console.error('Error creating rescue alert:', error);
    res.status(500).json({ error: 'Failed to create rescue alert' });
  }
}

export async function createSafeAlertController(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await createSafeAlert(userId);
    res.status(200).json({ message: 'Safe alert created successfully' });
  } catch (error) {
    console.error('Error creating safe alert:', error);
    res.status(500).json({ error: 'Failed to create safe alert' });
  }
}

export async function createEvacuationAlertController(req, res) {
  try {
    const { userId, evacuationZone } = req.body;
    
    if (!userId || !evacuationZone) {
      return res.status(400).json({ error: 'userId and evacuationZone are required' });
    }

    await createEvacuationAlert(userId, evacuationZone);
    res.status(200).json({ message: 'Evacuation alert created successfully' });
  } catch (error) {
    console.error('Error creating evacuation alert:', error);
    res.status(500).json({ error: 'Failed to create evacuation alert' });
  }
}

export async function createAllClearAlertController(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await createAllClearAlert(userId);
    res.status(200).json({ message: 'All clear alert created successfully' });
  } catch (error) {
    console.error('Error creating all clear alert:', error);
    res.status(500).json({ error: 'Failed to create all clear alert' });
  }
}

export async function sendBulkNotificationsController(req, res) {
  try {
    const { userIds, message, alertType } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || !message) {
      return res.status(400).json({ error: 'userIds array and message are required' });
    }

    await sendBulkNotifications(userIds, message, alertType);
    res.status(200).json({ message: `Bulk notifications sent to ${userIds.length} users` });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ error: 'Failed to send bulk notifications' });
  }
}

export async function getUserAlertsController(req, res) {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const alerts = await getUserAlerts(userId, parseInt(limit));
    res.status(200).json({ alerts });
  } catch (error) {
    console.error('Error getting user alerts:', error);
    res.status(500).json({ error: 'Failed to get user alerts' });
  }
}

export async function markAlertAsReadController(req, res) {
  try {
    const { alertId } = req.params;
    
    if (!alertId) {
      return res.status(400).json({ error: 'alertId is required' });
    }

    await markAlertAsRead(alertId);
    res.status(200).json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({ error: 'Failed to mark alert as read' });
  }
}

export async function registerDeviceTokenController(req, res) {
  try {
    const { userId, pushToken, deviceType } = req.body;
    
    if (!userId || !pushToken) {
      return res.status(400).json({ error: 'userId and pushToken are required' });
    }

    await registerDeviceToken(userId, pushToken, deviceType);
    res.status(200).json({ message: 'Device token registered successfully' });
  } catch (error) {
    console.error('Error registering device token:', error);
    res.status(500).json({ error: 'Failed to register device token' });
  }
}
