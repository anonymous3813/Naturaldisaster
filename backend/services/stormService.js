import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import * as turf from '@turf/turf';
import { buildPriorityQueue } from './priorityQueue.js';
import { createAlert } from './notificationService.js';

const prisma = new PrismaClient();
const GDACS_BASE = 'https://www.gdacs.org/xml/rss.xml';
const GDACS_POLYGON_BASE = 'https://www.gdacs.org/gdacsapi/storm/getpolygon';
const AZURE_MAPS_KEY = process.env.AZURE_MAPS_KEY;

export function pointInPolygon([lat, lon], polygonGeoJSON) {
  const point = turf.point([lon, lat]);
  const polygon = turf.polygon(polygonGeoJSON.coordinates);
  return turf.booleanPointInPolygon(point, polygon);
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

  return items.map(item => {
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
      name: item.title,
      lat,
      lon,
      severity
    };
  });
}

export async function getAzureImpactZones(lat, lon) {
  try {
    const res = await axios.get(
      'https://atlas.microsoft.com/weather/tropical/storms/locations/json',
      {
        params: {
          'api-version': '1.1',
          current: true,
          'subscription-key': AZURE_MAPS_KEY
        }
      }
    );

    const storm = res.data.storms.find(
      (s) =>
        Math.abs(s.location.latitude - lat) < 1 &&
        Math.abs(s.location.longitude - lon) < 1
    );

    if (!storm) return [];

    return storm.windRadiuses.map((radius) => ({
      polygon: radius.geometry,
      severity: storm.severity
    }));
  } catch (err) {
    console.error('Azure Maps fetch failed:', err);
    return [];
  }
}

export async function getStormsWithZones() {
  const disasterResponse = await axios.get(GDACS_BASE);
  const disasters = parseGDACS(disasterResponse.data);

  for (const storm of disasters) {
    try {
      const zoneRes = await axios.get(`${GDACS_POLYGON_BASE}?eventid=${storm.id}&format=geojson`);
      storm.zone = zoneRes.data; 
    } catch (err) {
      console.error(`Could not fetch GDACS polygon for storm ${storm.id}`, err);
      storm.zone = null;
    }

    const impactZones = await getAzureImpactZones(storm.lat, storm.lon);
    storm.impactZones = impactZones;

    await prisma.stormSnapshot.create({
      data: {
        lat: storm.lat,
        lon: storm.lon,
        severity: storm.severity,
        zone: storm.zone,
        impactZones
      }
    });

    const users = await prisma.userLocation.findMany({ where: { safe: false } });
    const affectedUsers = users.filter(u => {
      let inside = false;
      if (storm.zone) inside = pointInPolygon([u.lat, u.lon], storm.zone);
      for (const z of impactZones) {
        if (pointInPolygon([u.lat, u.lon], z.polygon)) inside = true;
      }
      return inside;
    });

    const pq = buildPriorityQueue(affectedUsers);
    for (const user of pq) {
      await createAlert(
        user.userId,
        `🚨 ${storm.name} approaching. Evacuate or take cover immediately!`
      );
    }

    storm.priorityQueue = pq;
  }

  return disasters;
}
