import {saveUserLocation} from '../services/locationService.js'
import { getAllUserLocations } from '../services/locationService.js'
export async function postLocation(req, res) {
    try {
        const {userId, lat, lon} = req.body;
        if (!userId || !lat || !lon) {
            return res.status(400).json({error: "Need all data to continue"})
        }

        await saveUserLocation(userId, lon, lat)
        return res.status(200).json({message: 'location updated'})

    }
    catch (err) {
        console.log(err)
        res.status(500).json({error: "internal software error"})

    }
}

export async function getAllLocations(req, res) {
    try {
        const users = await getAllUserLocations()
        res.status(200).json(users)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "internal server error" })
    }
}

export async function exportLocationsCSV(req, res) {
    try {
        const locations = await getAllUserLocations();
        
        // Create CSV header
        const csvHeader = 'userId,latitude,longitude,safe,timestamp\n';
        
        // Convert locations to CSV rows
        const csvRows = locations.map(location => {
            const timestamp = new Date(location.timestamp).toISOString();
            return `${location.userId},${location.lat},${location.lon},${location.safe},${timestamp}`;
        }).join('\n');
        
        // Combine header and rows
        const csvContent = csvHeader + csvRows;
        
        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="user_locations.csv"');
        res.send(csvContent);
        
    } catch (error) {
        console.error('Error exporting locations CSV:', error);
        res.status(500).json({ error: 'Failed to export locations CSV' });
    }
}