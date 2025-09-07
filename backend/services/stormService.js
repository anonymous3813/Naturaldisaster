import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import * as turf from '@turf/turf';
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

    // Extract ID properly from XML structure
    let stormId = 'unknown';
    if (item.guid) {
      stormId = typeof item.guid === 'string' ? item.guid : (item.guid._text || item.guid.text || 'unknown');
    } else if (item.link) {
      stormId = typeof item.link === 'string' ? item.link : (item.link._text || item.link.text || 'unknown');
    }

    return {
      id: stormId,
      name: item.title,
      lat,
      lon,
      severity
    };
  });
}

export async function getAzureImpactZones(lat, lon, severity = 1, stormName = '') {
  try {
    const activeStormsRes = await axios.get(
      'https://atlas.microsoft.com/weather/tropical/storms/active/json',
      {
        params: {
          'api-version': '1.1',
          'subscription-key': AZURE_MAPS_KEY
        }
      }
    );

    const activeStorms = activeStormsRes.data.results || [];
    
    
    let closestStorm = null;
    let minDistance = Infinity;
    
    for (const storm of activeStorms) {
     
      const stormLocationRes = await axios.get(
        'https://atlas.microsoft.com/weather/tropical/storms/locations/json',
        {
          params: {
            'api-version': '1.1',
            'subscription-key': AZURE_MAPS_KEY,
            'year': storm.year,
            'basinId': storm.basinId,
            'govId': storm.govId
          }
        }
      );
      
      if (stormLocationRes.data.results && stormLocationRes.data.results.length > 0) {
        const stormLocation = stormLocationRes.data.results[0];
        const distance = getDistance(lat, lon, stormLocation.location.latitude, stormLocation.location.longitude);
        
        if (distance < minDistance && distance < 1000) { // Within 1000km
          minDistance = distance;
          closestStorm = {
            ...storm,
            location: stormLocation.location,
            windSpeed: stormLocation.sustainedWind?.value || 0,
            maxWindGust: stormLocation.maxWindGust?.value || 0,
            status: stormLocation.status
          };
        }
      }
    }
    
    if (closestStorm && closestStorm.windSpeed > 0) {
      const impactZones = [];
      
      
      const windSpeed = closestStorm.windSpeed;
      const maxWindGust = closestStorm.maxWindGust;
      
      
      const windThresholds = [
        { speed: windSpeed * 0.8, radius: 50, name: 'Outer' },
        { speed: windSpeed * 0.9, radius: 30, name: 'Middle' },
        { speed: windSpeed, radius: 20, name: 'Inner' }
      ];
      
      
      if (maxWindGust > windSpeed * 1.2) {
        windThresholds.push({ speed: maxWindGust, radius: 15, name: 'Core' });
      }
      
      for (const threshold of windThresholds) {
        const polygon = createWindRadiusPolygon(
          closestStorm.location.latitude,
          closestStorm.location.longitude,
          threshold.radius,
          threshold.speed
        );
        
        impactZones.push({
          polygon: {
            type: "Polygon",
            coordinates: [polygon]
          },
          severity: getSeverityFromWindSpeed(threshold.speed),
          radius: threshold.radius,
          windSpeed: threshold.speed,
          type: 'wind',
          source: 'azure_maps_real_wind_data',
          stormId: `${closestStorm.basinId}${closestStorm.govId}`,
          stormName: closestStorm.name,
          zoneName: threshold.name
        });
      }
      
      console.log(`Created ${impactZones.length} REAL impact zones from Azure Maps wind data for storm ${closestStorm.name} (${windSpeed} km/h)`);
      return impactZones;
    }
    
    
    console.log(`No real storm data available for ${stormName}`);
    return [];
    
  } catch (err) {
    console.error('Failed to get real impact zones from Azure Maps:', err.message);
    return [];
  }
}


function createWindRadiusPolygon(centerLat, centerLon, radiusKm, windSpeed) {
  const points = [];
  const numPoints = 32; 
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 360) / numPoints;
    const radians = (angle * Math.PI) / 180;
    
   
    const latOffset = (radiusKm / 111) * Math.cos(radians);
    const lonOffset = (radiusKm / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(radians);
    
    points.push([centerLon + lonOffset, centerLat + latOffset]);
  }
  
  
  points.push(points[0]);
  return points;
}


function getSeverityFromWindSpeed(windSpeed) {
  if (windSpeed >= 74) return 5; 
  if (windSpeed >= 64) return 4; 
  if (windSpeed >= 39) return 3; 
  if (windSpeed >= 25) return 2; 
  return 1; // Light winds
}


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

export async function getStormsWithZones() {
  const disasterResponse = await axios.get(GDACS_BASE);
  const disasters = parseGDACS(disasterResponse.data);

  for (const storm of disasters) {
    try {
      if (!storm.id || storm.id === 'unknown') {
        console.log(`Skipping GDACS polygon for storm ${storm.name} - invalid ID: ${storm.id}`);
        storm.zone = null;
      } else {
        const zoneRes = await axios.get(`${GDACS_POLYGON_BASE}?eventid=${storm.id}&format=geojson`);
        storm.zone = zoneRes.data; 
      }
    } catch (err) {
      console.error(`Could not fetch GDACS polygon for storm ${storm.id}`, err);
      storm.zone = null;
    }

   
    try {
      const impactZones = await getAzureImpactZones(storm.lat, storm.lon, storm.severity, storm.name);
      storm.impactZones = impactZones;
      console.log(`Created ${impactZones.length} impact zones for storm ${storm.name}`);
    } catch (error) {
      console.log('Failed to create impact zones, using empty zones');
      storm.impactZones = [];
    }

    await prisma.stormSnapshot.create({
      data: {
        lat: storm.lat,
        lon: storm.lon,
        radius: 100, 
        severity: storm.severity
      }
    });

  }

  return disasters;
}
