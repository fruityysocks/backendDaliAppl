/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import OpenAI from 'openai';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import WebClient from '@slack/web-api';
import Nap from '../models/napModel';

// const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function findNapFiles(req, res) {
  const { type, challenge, event } = req.body;

  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  if (event && event.type === 'message' && !event.subtype) {
    try {
      const userInfo = await slackClient.users.info({ user: event.user });

      let imageUrl = null;
      if (event.files && event.files.length > 0) {
        const imageFile = event.files.find((file) => { return file.mimetype.startsWith('image/'); });
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
        }
      }
    } catch (err) {
      console.error('Error saving nap:', err.data || err);
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(404);
}

export async function fetchOldNaps(channelId) {
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
        const imageFile = msg.files.find((file) => { return file?.mimetype && file.mimetype.startsWith('image/'); });
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
            const poem = await generatePoemFromImage(newNap.napImage);
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistant = await openai.beta.assistants.create(
  {
    model: 'gpt-4.1-mini',
    name: 'poet',
    instructions: 'Write a three sentence long poem about the image above. Keep it short and funny; do not make potentially offensive jokes or use curse words.',
    tools: [{ type: 'code_interpreter' }],
  },
);

export async function generatePoemFromImage(imageUrl) {
  try {
    if (!imageUrl) {
      throw new Error('Image URL is required to generate poem.');
    }

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
    });

    const tempPath = path.resolve('napImage.jpg');
    await fsPromises.writeFile(tempPath, response.data);

    const file = await openai.files.create({
      file: fs.createReadStream(tempPath),
      purpose: 'vision',
    });
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_file',
              image_file: { file_id: file.id },
            },
          ],
        },
        {
          role: 'user',
          content: '',
        },
      ],
    });
    const run = await openai.beta.threads.runs.create(
      thread.id,
      { assistant_id: assistant.id },
    );
    await fsPromises.unlink(tempPath).catch(() => {});
    console.log('OpenAI completion response:', run);
    const poem = run.choices[0].message.content.trim();
    return poem;
  } catch (error) {
    console.error('Error generating poem from image:', error);
    throw error;
  }
}

export async function jpgToPng(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    const pngBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();
    return pngBuffer;
  } catch (error) {
    console.error('Error converting image:', error);
    throw error;
  }
}
