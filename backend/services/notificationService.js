import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendPushNotification(userId, message) {
  try {
    const device = await prisma.userDevice.findUnique({ where: { userId } });
    if (!device?.pushToken) {
      console.log(`No push token found for user ${userId}`);
      return;
    }

    const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
    if (!FCM_SERVER_KEY) {
      console.log('FCM_SERVER_KEY not configured, skipping push notification');
      return;
    }

    const response = await axios.post('https://fcm.googleapis.com/fcm/send', {
      to: device.pushToken,
      notification: {
        title: 'Disaster Alert',
        body: message,
        icon: 'ic_notification',
        sound: 'default',
        priority: 'high'
      },
      data: {
        userId: userId,
        type: 'disaster_alert',
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
          default_sound: true,
          default_vibrate_timings: true
        }
      }
    }, {
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Push notification sent to user ${userId}: ${message}`);
    return response.data;
  } catch (err) {
    console.error(`Failed to send push notification to user ${userId}:`, err.message);
    
    if (err.response?.status === 400 && err.response?.data?.results?.[0]?.error === 'InvalidRegistration') {
      await prisma.userDevice.deleteMany({ where: { userId } });
      console.log(`Removed invalid push token for user ${userId}`);
    }
  }
}

export async function createAlert(userId, message, alertType = 'general') {
  try {
    await prisma.alert.create({
      data: {
        userId,
        message,
        timestamp: new Date(),
        read: false,
        alertType
      },
    });

    await sendPushNotification(userId, message);

    console.log(`Alert created for user ${userId}: ${message}`);
  } catch (err) {
    console.error(`Failed to create alert for user ${userId}:`, err);
  }
}

export async function createSOSAlert(userId) {
  const message = '🚨 SOS ALERT: You appear to be offline in a danger zone! Emergency services have been notified.';
  await createAlert(userId, message, 'sos');
}

export async function createStormAlert(userId, stormName, severity) {
  const messages = {
    5: `🚨 EXTREME DANGER: Category 5 storm ${stormName} approaching! Evacuate immediately!`,
    4: `⚠️ HIGH DANGER: Category 4 storm ${stormName} nearby! Seek shelter now!`,
    3: `⚠️ MODERATE DANGER: Category 3 storm ${stormName} in your area! Stay alert!`,
    2: `⚠️ LOW DANGER: Category 2 storm ${stormName} approaching! Prepare for impact!`,
    1: `ℹ️ ADVISORY: Category 1 storm ${stormName} in your area! Monitor conditions!`
  };
  
  const message = messages[severity] || messages[1];
  await createAlert(userId, message, 'storm');
}

export async function createRescueAlert(userId, responderId) {
  const message = `🚑 RESCUE ALERT: First responder ${responderId} is en route to your location! Stay put and stay safe!`;
  await createAlert(userId, message, 'rescue');
}

export async function createSafeAlert(userId) {
  const message = `✅ SAFE: You have been marked as safe by emergency services. Stay in your current location.`;
  await createAlert(userId, message, 'safe');
}

export async function createEvacuationAlert(userId, evacuationZone) {
  const message = `🚨 EVACUATION ORDER: You are in evacuation zone ${evacuationZone}. Leave immediately via designated routes!`;
  await createAlert(userId, message, 'evacuation');
}

export async function createAllClearAlert(userId) {
  const message = `✅ ALL CLEAR: The danger has passed in your area. You may resume normal activities.`;
  await createAlert(userId, message, 'all_clear');
}

export async function sendBulkNotifications(userIds, message, alertType = 'bulk') {
  const promises = userIds.map(userId => createAlert(userId, message, alertType));
  await Promise.allSettled(promises);
  console.log(`Bulk notifications sent to ${userIds.length} users`);
}

export async function getUserAlerts(userId, limit = 10) {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
    return alerts;
  } catch (err) {
    console.error(`Failed to get alerts for user ${userId}:`, err);
    return [];
  }
}

export async function markAlertAsRead(alertId) {
  try {
    await prisma.alert.update({
      where: { id: alertId },
      data: { read: true }
    });
  } catch (err) {
    console.error(`Failed to mark alert ${alertId} as read:`, err);
  }
}

export async function registerDeviceToken(userId, pushToken, deviceType = 'android') {
  try {
    await prisma.userDevice.upsert({
      where: { userId },
      update: { 
        pushToken, 
        deviceType,
        lastUpdated: new Date()
      },
      create: { 
        userId, 
        pushToken, 
        deviceType,
        lastUpdated: new Date()
      }
    });
    console.log(`Device token registered for user ${userId}`);
  } catch (err) {
    console.error(`Failed to register device token for user ${userId}:`, err);
  }
}

