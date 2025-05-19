/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import axios from 'axios';
import sharp from 'sharp';
// import WebClient from '@slack/web-api';
import Nap from '../models/napModel';
import NapBot from './openAIController';

const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function newNapFile(req, res) {
  const {
    type, challenge, event, assisstantId, threadId,
  } = req.body;

  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  if (event && event.type === 'message' && !event.subtype) {
    try {
      const userInfo = await slackClient.users.info({ user: event.user });

      let imageUrl = null;
      if (event.files && event.files.length > 0) {
        const imageFile = event.files.find((file) => {
          return file.mimetype.startsWith('image/');
        });
        if (imageFile) {
          imageUrl = imageFile.thumb_1024;

          const newNap = new Nap({
            userId: event.user,
            username: userInfo.user.real_name,
            text: event.text,
            timestamp: event.ts,
            napImage: imageUrl,
          });

          await newNap.save();
          console.log('Saved nap:', newNap);
          if (newNap.napImage) {
            const poem = await NapBot.generatePoemFromImage(newNap.napImage, assisstantId, threadId);
            console.log('Generated Poem:', poem);
            await newNap.updateOne({ generatedPoem: poem });
          }
        }
      }
    } catch (err) {
      console.error('Error saving nap:', err.data || err);
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(404);
}

export async function fetchOldNaps(channelId, assisstantId, threadId) {
  let hasMore = true;
  let cursor;
  while (hasMore) {
    // eslint-disable-next-line no-await-in-loop
    const result = await slackClient.conversations.history({
      channel: channelId,
      cursor,
      limit: 200,
    });
    // eslint-disable-next-line no-undef
    const { messages, response_metadata } = result;
    console.log(`Fetched ${messages.length} messages`);

    // eslint-disable-next-line no-restricted-syntax
    for (const msg of messages) {
      if (!msg.subtype && msg.files && msg.files.length > 0) {
        const imageFile = msg.files.find((file) => {
          return file?.mimetype && file.mimetype.startsWith('image/');
        });
        if (imageFile) {
          const userInfo = await slackClient.users.info({ user: msg.user });
          const existing = await Nap.findOne({ timestamp: msg.ts });
          // eslint-disable-next-line no-continue
          if (existing) continue;

          const newNap = new Nap({
            userId: msg.user,
            username: userInfo.user.real_name,
            text: msg.text,
            timestamp: msg.ts,
            napImage: imageFile.thumb_1024,
          });

          await newNap.save();
          console.log(`Saved old nap from ${userInfo.user.real_name}`);
          if (newNap.napImage) {
            const poem = await NapBot.generatePoemFromImage(newNap.napImage, assisstantId, threadId);
            console.log('Generated Poem:', poem);
            await newNap.updateOne({ generatedPoem: poem });
          }
        }
      }
    }

    // eslint-disable-next-line no-undef
    cursor = response_metadata?.next_cursor;
    hasMore = !!cursor;
  }

  console.log('Finished importing all old naps');
}

export async function getNaps() {
  try {
    const naps = await Nap.find();
    console.log('naps found successfully');
    return naps;
  } catch (error) {
    throw new Error(`get naps error: ${error}`);
  }
}

export async function jpgToPng(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    return pngBuffer;
  } catch (error) {
    console.error('Error converting image:', error);
    throw error;
  }
}
