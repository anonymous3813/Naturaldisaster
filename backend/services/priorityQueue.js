import { Heap } from 'heap-js';
import { PrismaClient } from '@prisma/client';
import { createAlert } from './notificationService.js';
import { getAzureImpactZones } from './stormService.js';

const prisma = new PrismaClient();

export const priorityQueue = new Heap((a, b) => b.danger - a.danger);

export async function flagUsersInStorm(impactZones) {
  const users = await prisma.userLocation.findMany();

  priorityQueue.clear();

    for (const user of users) {
      let danger = 0;
      let inHighImpactZone = false;

      
      for (const zone of impactZones) {
        if (pointInPolygon([user.lat, user.lon], zone.polygon.coordinates[0])) {
          
          if (zone.severity >= 3) {
            inHighImpactZone = true;
            danger = zone.severity * 100;
            break; 
          }
        }
      }

    
      if (inHighImpactZone) {
        priorityQueue.push({ ...user, danger });
      }
    }

  return priorityQueue.toArray().slice(0, 50);
}

export async function alertUsers(users) {
  for (const user of users) {
    await createAlert(user.userId, '🚨 Storm incoming! Evacuate immediately!');
  }
}

// Haversine distance
export function getDistance(lat1, lon1, lat2, lon2) {
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


function pointInPolygon(point, polygon) {
  let x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0], yi = polygon[i][1];
    let xj = polygon[j][0], yj = polygon[j][1];
    let intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
