/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import Nap from '../models/napModel';

const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
// const napChannelId = 'C54HZT72B';

export async function handleSlackEvent(req, res) {
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
          imageUrl = imageFile.thumb_720;

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
        const imageFile = msg.files.find((file) => { return file.mimetype.startsWith('image/'); });
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
            napImage: imageFile.thumb_720,
          });

          await newNap.save();
          console.log(`Saved old nap from ${userInfo.user.real_name}`);
        }
      }
    }

    // eslint-disable-next-line no-undef
    cursor = response_metadata?.next_cursor;
    hasMore = !!cursor;
  }

  console.log('Finished importing all old naps');
}
