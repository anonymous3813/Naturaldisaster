import axios from 'axios'
import { PrismaClient } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import {flagUsersInStorm, buildPriorityQueue} from './priorityQueue.js'
import {createAlert} from './notificationService.js'
const GDACS_BASE = 'https://www.gdacs.org/xml/rss.xml';
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_KEY = process.env.WEATHER_API_KEY;
const prisma = new PrismaClient()



export async function getStormsWithZones() {
    
    const disasterResponse = await axios.get(GDACS_BASE);
    const disasters = parseGDACS(disasterResponse.data);
  
    for (const storm of disasters) {
    
      try {
        const zoneRes = await axios.get(
          `${GDACS_POLYGON_BASE}?eventid=${storm.id}&format=geojson`
        );
        storm.zone = zoneRes.data; 
      } catch (err) {
        console.error(`⚠️ Could not fetch polygon for storm ${storm.id}`, err);
        continue;
      }
  
      
      await prisma.stormSnapshot.create({
        data: {
          lat: storm.lat,
          long: storm.lon,
          severity: storm.severity,
          zone: storm.zone 
        }
      });
  
      
      const users = await prisma.userLocation.findMany();
      const affectedUsers = users.filter(u =>
        pointInPolygon([u.lat, u.lon], storm.zone)
      );
  
      
      const pq = buildPriorityQueue(affectedUsers);
      for (const user of pq) {
        await createAlert(
          user.userId,
          `🚨 ${storm.name} approaching. Evacuate or take cover immediately!`
        );
      }
    }
  
    return disasters;
  }



export function parseGDACS(xmlString) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseTagValue: true,
    parseAttributeValue: true
  });

  const jsonObj = parser.parse(xmlString);

  
  const items = jsonObj.rss?.channel?.item || [];

  
  const storms = items.map(item => {

    let lat = 0, lon = 0;
    if (item['georss:point']) {
      const [latStr, lonStr] = item['georss:point'].split(' ');
      lat = parseFloat(latStr);
      lon = parseFloat(lonStr);
    }

    let severity = 1;
    if (item.description) {
      const match = item.description.match(/Severity: (\d+)/);
      if (match) severity = parseInt(match[1]);
    }

    return {
      id: item.guid || item.link,
      title: item.title,
      lat,
      lon,
      severity
    };
  });

  return storms;
}
