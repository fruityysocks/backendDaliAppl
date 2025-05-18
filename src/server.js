import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import apiRoutes from './routes/routes';
import slackRoutes from './routes/slackRoutes';

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

startServer();
