import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import apiRoutes from './routes/routes';
// import slackRoutes from './routes/slackRoutes';
import { fetchOldNaps } from './controllers/slackEventsController';

const app = express();
dotenv.config();

app.use(cors());

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hi');
});

app.use('/api', apiRoutes);
// app.use('/slack', slackRoutes);

const mongoUri = process.env.MONGO_URI;

app.get('/import-old-naps', async (req, res) => {
  const napChannelId = process.env.NAPS_CHANNEL_ID;
  console.log(napChannelId);
  try {
    await fetchOldNaps(napChannelId);
    res.setHeader('Content-Type', 'text/plain');
    res.send('Imported old naps!');
  } catch (err) {
    console.error('Error importing old naps:', err);
    res.status(500).send('Error importing old naps');
  }
});

async function startServer() {
  try {
    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');

    const port = process.env.PORT || 9090;
    app.listen(port);

    console.log(`Listening on port ${port}`);
  } catch (error) {
    console.error(error);
  }
}

startServer();
