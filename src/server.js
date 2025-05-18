import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import apiRoutes from './routes';

const app = express();

app.use(cors());

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hi');
});

app.post('/slack/events', (req, res) => {
  const { type, challenge, event } = req.body;

  if (type === 'url_verification') {
    return res.send({ challenge });
  }

  // Respond to event callbacks
  if (type === 'event_callback') {
    if (event && event.type === 'message') {
      console.log('New message:', event.text);
    }

    // Acknowledge the event
    return res.sendStatus(200);
  }

  return res.sendStatus(400);
});

app.use('/api', apiRoutes);

const MONGO_URI = 'mongodb+srv://prishita:neverwhere@cluster0.ykp9w4j.mongodb.net/daliApp?retryWrites=true&w=majority&appName=Cluster0';

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

app.listen(9090, () => {
  console.log('Server is running on port 9090');
});

startServer();
