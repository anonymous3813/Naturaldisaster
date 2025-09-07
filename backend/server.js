import express from 'express'; 
import dotenv from 'dotenv';
import locationRoutes from './routes/locationRoutes.js';
import stormRoutes from './routes/stormRoutes.js';
import priorityRoutes from './routes/priorityRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/locations', locationRoutes);
app.use('/api/storms', stormRoutes);
app.use('/api/priorities', priorityRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.send('Backend Running'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
