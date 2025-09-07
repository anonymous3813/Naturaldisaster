import { Heap } from 'heap-js';
import { PrismaClient } from '@prisma/client';
import { createAlert } from './notificationService.js';

const prisma = new PrismaClient()

export const priorityQueue = new Heap((a, b) => b.danger - a.danger);

/**
 * @param {Object} storm - { lat, lon, radius, severity }
 * @returns Array of affected users with danger scores
 */
export async function flagUsersInStorm(storm) {
    const { lat, lon, radius, severity } = storm;
  
    
    const users = await prisma.userLocation.findMany();
  
    
    const affectedUsers = users
      .map(user => {
        const distance = getDistance(lat, lon, user.lat, user.lon);
  
        if (distance <= radius) {
          
          const proximityFactor = 1 - distance / radius; 
          const danger = proximityFactor * severity * 100; 
  
          return { ...user, distance, danger };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.danger - a.danger); 
  
    
    return affectedUsers.slice(0, 50); 
  }
  


export function buildPriorityQueue(users) {
  priorityQueue.clear();
  users.forEach(user => priorityQueue.push(user));
  return priorityQueue;
}


export async function alertUsers(users) {
  for (const user of users) {
    await createAlert(user.userId, 'Storm incoming! Evacuate immediately!');
  }
}

//Haversine Distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
