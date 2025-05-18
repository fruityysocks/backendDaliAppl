const fs = require('fs');
const path = require('path');
const { getUser } = require('./userController');

const readAllFiles = (folderPath) => {
  const files = fs.readdirSync(folderPath);
  let allData = [];

  files.forEach((file) => {
    if (file.endsWith('.json')) {
      const filePath = path.join(folderPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      allData = allData.concat(data);
    }
  });

  return allData;
};

const usersPath = path.join(__dirname, '../slackData/users.json');
const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

const getSlackUser = (userId) => {
  const user = getUser(userId);
  const slackuser = users.find((u) => { return u.name === user.name; });
  return slackuser;
};

const napDataPath = path.join(__dirname, '../slackData/daliNaps');
const napData = readAllFiles(napDataPath);

const getNaps = (req, res) => {
  const allNaps = napData.filter((nap) => { return nap.subtype !== 'channel_join' && nap.subtype !== 'channel_leave'; });
  console.log(allNaps);
  res.json(allNaps);
};

const getNap = (singleNap) => {
  return {
    message: singleNap.text,
    user: singleNap.user,
    img: singleNap.thumb_480,
  };
};

// const getTopNapper = (req, res) => {
//   const counts = {};
//   napData.forEach((entry) => {
//     const name = getDisplayName(entry.user || 'unknown');
//     counts[name] = (counts[name] || 0) + 1;
//   });

//   const sorted = Object.entries(counts).sort((a, b) => { return b[1] - a[1]; });
//   const [topUser, count] = sorted[0];
//   res.json({ topNapper: topUser, naps: count });
// };

export { getSlackUser, getNaps, getNap };
