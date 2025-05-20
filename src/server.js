import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { fetchOldNaps } from './controllers/slackEventsController';
import { initialisingOpenAI } from './controllers/openAIController';

const app = express();
dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hi');
});

app.use('/api', apiRoutes);
// app.use('/slack', slackRoutes);

const mongoUri = process.env.MONGO_URI;
const napChannelId = process.env.NAPS_CHANNEL_ID;

app.get('/import-old-naps', async (req, res) => {
  try {
    const { assistantId, threadId } = await initialisingOpenAI();
    await fetchOldNaps(napChannelId, assistantId, threadId);
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
