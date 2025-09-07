import axios from 'axios'
const GDACS_BASE = 'https://www.gdacs.org/xml/rss.xml';
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_KEY = process.env.WEATHER_API_KEY;


export async function getStormsWithZones() {
    const disasterResponse = await axios.get(GDACS_BASE)
    const disasters = disasterResponse.data

    return disasters;
}