import express from 'express'; 
import dotenv from 'dotenv'
import locationRoutes from './routes/locationRoutes'
import stormRoutes from './routes/stormRoutes'
import priorityRoutes from './routes/priorityRoutes'

dotenv.config()


const app = express()
const PORT = process.env.PORT


app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/locations', locationRoutes)
app.use('/api/storms', stormRoutes)
app.use('/api/priorities', priorityRoutes)

app.get('/', (req, res) => res.send('Backend Running'))

app.listen(PORT, () => {
    console.log('Server is running on port $(PORT)')
})




