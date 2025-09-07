import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

import { priorityQueue } from "./priorityQueue.js";

export async function saveUserLocation(userId, long, lat, danger = 0) {
    await prisma.UserLocation.find({
        where: {
            userId
        },
        update: {
            lat, long, timestamp: new Date()
        },
        create: {
            userId, lat, long, timestamp: new Date()
        }


    })

    priorityQueue.push({userId, lat, long, danger})

}

export function getPriorityUsers(topN = 10) {
    return priorityQueue.peek(topN)
}

export async function getAllUserLocations() {
    return await prisma.UserLocation.findMany();
}