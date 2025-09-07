import { prisma } from './prisma.js';
import { getDistance } from './priorityService.js'; 


export async function markUserSafe(responderId, userId, responderLat, responderLon, radiusFeet = 50) {
  const user = await prisma.userLocation.findUnique({ where: { userId } });
  if (!user) throw new Error('User not found');

  const radiusKm = radiusFeet * 0.0003048; 
  const distance = getDistance(responderLat, responderLon, user.lat, user.long);

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
  const distance = getDistance(responderLat, responderLon, user.lat, user.long);

  if (distance <= radiusKm) {
    
    return { success: true, userId: user.userId, distanceKm: distance };
  }

  return { success: false, error: 'User is outside the allowed radius' };
}


