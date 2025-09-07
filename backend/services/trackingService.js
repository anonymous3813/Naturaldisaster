import { PrismaClient } from '@prisma/client';
import { getDistance } from './priorityQueue.js'; 

const prisma = new PrismaClient();

export async function markUserSafe(responderId, userId, responderLat, responderLon, radiusFeet = 50) {
  const user = await prisma.userLocation.findUnique({ where: { userId } });
  if (!user) throw new Error('User not found');

  const radiusKm = radiusFeet * 0.0003048; 
  const distance = getDistance(responderLat, responderLon, user.lat, user.lon);

  if (distance <= radiusKm) {
    const updatedUser = await prisma.userLocation.update({
      where: { userId },
      data: { safe: true }
    });
    return { success: true, user: updatedUser };
  }

  return { success: false, error: 'User is outside the allowed radius' };
}


export async function respondToUser(responderId, userId, responderLat, responderLon, radiusFeet = 50) {
  const user = await prisma.userLocation.findUnique({ where: { userId } });
  if (!user) throw new Error('User not found');

  const radiusKm = radiusFeet * 0.0003048;
  const distance = getDistance(responderLat, responderLon, user.lat, user.lon);

  if (distance <= radiusKm) {
    
    return { success: true, userId: user.userId, distanceKm: distance };
  }

  return { success: false, error: 'User is outside the allowed radius' };
}

export async function getRescueStats() {
  const totalUsers = await prisma.userLocation.count();
  const safeUsers = await prisma.userLocation.count({ where: { safe: true } });
  const atRiskUsers = totalUsers - safeUsers;
  
  return {
    totalUsers,
    safeUsers,
    atRiskUsers,
    activeResponders: 0, // This would need to be tracked separately
    rescueAttempts: 0    // This would need to be tracked separately
  };
}


