import OpenAI from 'openai';
import fs from 'fs';
import axios from 'axios';
import fsPromises from 'fs/promises';
import path from 'path';
import { setTimeout } from 'timers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function initialisingOpenAI() {
  const assistant = await createAssistant();
  const assistantId = assistant.id;
  return { assistantId };
}

async function createAssistant() {
  try {
    const assistant = await openai.beta.assistants.create({
      model: 'gpt-4.1-mini',
      name: 'poet',
      instructions:
        'You are a funny poet bot. When you recieve an image you come up with amusing poetry inspired from the image.',
      tools: [{ type: 'code_interpreter' }],
    });
    return assistant;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
}

export async function generatePoemFromImage(imageUrl, assisstantId) {
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
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;

    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: 'Write a three sentence long poem for each of the images below. Keep it short and funny; do not make potentially offensive jokes or use curse words.',
    });

    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: [
        {
          type: 'image_file',
          image_file: { file_id: file.id },
        },
      ],
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assisstantId,
    });

    // eslint-disable-next-line no-unused-vars
    const completedRun = await waitForRunToFinish(threadId, run.id);
    const threadMessages = await openai.beta.threads.messages.list(threadId);
    const threadMessagesData = threadMessages.data;
    return String(threadMessagesData[0].content[0].text.value);
  } catch (error) {
    console.error('Error generating poem from image:', error);
    throw error;
  }
}

async function waitForRunToFinish(threadId, runId) {
  const startTime = Date.now();
  const timeout = 6000;
  while (Date.now() - startTime < timeout) {
    // eslint-disable-next-line no-await-in-loop
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (run.status === 'completed') {
      return run;
    }

    console.log('Still waiting... polling again in 1 second');
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => { setTimeout(resolve, 1000); });
  }

  throw new Error('Timed out waiting for run to finish');
}
