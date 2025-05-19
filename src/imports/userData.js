import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from '../models/userModel';

// 1. Connect to MongoDB
mongoose.connect('mongodb+srv://prishita:neverwhere@cluster0.ykp9w4j.mongodb.net/daliApp?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', async () => {
  console.log('Connected to MongoDB');
});
// 2. Read and parse the JSON file
const filePath = path.join(__dirname, 'userData.json');
const rawData = fs.readFileSync(filePath);
const originalData = JSON.parse(rawData, 'utf-8');

function transformUserData(raw) {
  return {
    name: raw.name,
    year: raw.year,
    dev: raw.dev,
    des: raw.des,
    pm: raw.pm,
    core: raw.core,
    mentor: raw.mentor,
    major: raw.major,
    minor: raw.minor,
    birthday: raw.birthday,
    home: raw.home,
    quote: raw.quote,
    favoriteThingOne: raw['favorite thing 1'],
    favoriteThingTwo: raw['favorite thing 2'],
    favoriteThingThree: raw['favorite thing 3'],
    favoriteDartmouthTradition: raw['favorite dartmouth tradition'],
    funFact: raw['fun fact'],
    profilePic: raw.picture,
  };
}

async function seed() {
  try {
    const transformed = originalData.map(transformUserData);
    await User.insertMany(transformed);
    console.log('Users seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
  }
}

seed();
