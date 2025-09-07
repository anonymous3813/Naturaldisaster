import express from 'express'; 
import dotenv from 'dotenv';
import locationRoutes from './routes/locationRoutes.js';
import stormRoutes from './routes/stormRoutes.js';
import priorityRoutes from './routes/priorityRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/locations', locationRoutes);
app.use('/api/storms', stormRoutes);
app.use('/api/priorities', priorityRoutes);
app.use('/api/track', trackingRoutes)


app.get('/', (req, res) => res.send('Backend Running'));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
