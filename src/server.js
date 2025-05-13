import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import apiRoutes from './routes';
// initialize
const app = express();

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable json message body for posting data to API
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads

// additional init stuff should go before hitting the routing

// default index route
app.get('/', (req, res) => {
  res.send('hi');
});

app.use('/api', apiRoutes);

const MONGO_URI = 'mongodb+srv://prishita:neverwhere@cluster0.ykp9w4j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// START THE SERVER
// =============================================================================
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const port = process.env.PORT || 9090;
    app.listen(port);

    console.log(`Listening on port ${port}`);
  } catch (error) {
    console.error(error);
  }
}

startServer();
