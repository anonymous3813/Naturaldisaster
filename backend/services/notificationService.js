import axios from 'axios';
import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient()
async function sendPushNotification(userId, message) {
  try {
    
    const device = await prisma.userDevice.findUnique({ where: { userId } });
    if (!device?.pushToken) return;

    
    await axios.post('https://push-api.example.com/send', {
      token: device.pushToken,
      title: 'Disaster Alert',
      body: message,
    });

    console.log(`Push sent to user ${userId}: ${message}`);
  } catch (err) {
    console.error(`Failed to send push to user ${userId}`, err);
  }
}

export async function createAlert(userId, message) {
  try {
    
    await prisma.alert.create({
      data: {
        userId,
        message,
        timestamp: new Date(),
        read: false,
      },
    });

    
    await sendPushNotification(userId, message);

    

  } catch (err) {
    console.error(`Failed to create alert for user ${userId}`, err);
  }
}


export async function createSOSAlert(userId) {
  const message = '⚠️ You appear to be offline in a danger zone! Tap SOS to send help immediately.';
  await createAlert(userId, message);
}

