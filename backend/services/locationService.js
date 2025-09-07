import { PrismaClient } from "@prisma/client";
import { priorityQueue } from "./priorityQueue.js";

const prisma = new PrismaClient();

export async function saveUserLocation(userId, lon, lat, danger = 0) {
  await prisma.UserLocation.upsert({
    where: { userId },
    update: { lat, lon, timestamp: new Date() },
    create: { userId, lat, lon, timestamp: new Date() },
  });

  priorityQueue.push({ userId, lat, lon, danger });
}

export function getPriorityUsers(topN = 10) {
  return priorityQueue.toArray().slice(0, topN); 
}

export async function getAllUserLocations() {
  return await prisma.userLocation.findMany();
}

