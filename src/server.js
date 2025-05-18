import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import apiRoutes from './routes/routes';
import slackRoutes from './routes/slackRoutes';
import { fetchOldNaps } from './controllers/slackEventsController';

const app = express();

app.use(cors());

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hi');
});

app.use('/api', apiRoutes);
app.use('/slack', slackRoutes);

const { MONGO_URI } = process.env;

app.get('/import-old-naps', async (req, res) => {
  await fetchOldNaps('C54HZT72B');
  res.send('Imported old naps!');
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('Connected to MongoDB');

    const port = process.env.PORT || 9090;
    app.listen(port);

    console.log(`Listening on port ${port}`);
  } catch (error) {
    console.error(error);
  }
}

startServer();
