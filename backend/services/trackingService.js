import { prisma } from './prisma.js';
import { getDistance } from './priorityService.js'; 


export async function markUserSafe(responderId, userId, responderLat, responderLon, radiusFeet = 50) {
  const user = await prisma.userLocation.findUnique({ where: { userId } });
  if (!user) throw new Error('User not found');

  
  const radiusKm = radiusFeet * 0.0003048;

  const distance = getDistance(responderLat, responderLon, user.lat, user.long);
  if (distance <= radiusKm) {
    
    await prisma.userLocation.update({
      where: { userId },
      data: { safe: true }
    });
    return true;
  }
  return false;
}


export async function getRescueStats() {
  const total = await prisma.userLocation.count();
  const saved = await prisma.userLocation.count({ where: { safe: true } });
  const remaining = total - saved;
  return { total, saved, remaining };
}
