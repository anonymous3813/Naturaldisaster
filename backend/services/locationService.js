import { PrismaClient } from "@prisma/client";
import { priorityQueue } from "./priorityQueue.js";

const prisma = new PrismaClient();

export async function saveUserLocation(userId, long, lat, danger = 0) {
  await prisma.UserLocation.upsert({
    where: { userId },
    update: { lat, long, timestamp: new Date() },
    create: { userId, lat, long, timestamp: new Date() },
  });

 
  priorityQueue.push({ userId, lat, long, danger });
}

export function getPriorityUsers(topN = 10) {
  return priorityQueue.toArray().slice(0, topN); 
}

export async function getAllUserLocations() {
  return await prisma.userLocation.findMany();
}

export async function getAllUserLocations() {
  return await prisma.UserLocation.findMany()
}

