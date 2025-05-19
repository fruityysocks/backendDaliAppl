import OpenAI from 'openai';
import fs from 'fs';
import axios from 'axios';
import fsPromises from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function initialisingOpenAI() {
  const assistant = await createAssistant();
  const thread = await openai.beta.threads.create();
  const assistantID = assistant.id;
  const threadID = thread.id;
  return { assistantID, threadID };
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
    console.log('Assistant created:', assistant);
    return assistant;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
}

export async function generatePoemFromImage(imageUrl, assisstantId, threadId) {
  console.log(assisstantId, threadId);
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

    await openai.beta.threads.messages.create(threadId, {
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
          content:
            'Write a three sentence long poem about the image above. Keep it short and funny; do not make potentially offensive jokes or use curse words.',
        },
      ],
    });
    console.log('thread updated');

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assisstantId,
    });
    console.log('running');

    await run;

    const napThreadResponse = await openai.beta.threads.retrieve(
      threadId,
    );
    console.log('OpenAI completion response:', napThreadResponse);
    await fsPromises.unlink(tempPath).catch(() => {});
    return 'hi';
  } catch (error) {
    console.error('Error generating poem from image:', error);
    throw error;
  }
}
