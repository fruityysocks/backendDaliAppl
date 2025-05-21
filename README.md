Backend – DALI Social Media App
This repository is the backend for a social media-inspired DALI Lab project. It fetches nap-related messages from the dali_naps Slack channel and uses the OpenAI API to generate short, three-sentence poems in response to each nap.

The backend supports basic CRUD operations, user handling from a challenge-provided JSON file, and poem generation via OpenAI. The deployed API currently loads up to 15 naps due to token limitations.

Architecture
Tech Stack
Express

Node 

MongoDB (via Mongoose)

Axios

OpenAI API

React Router

Sharp

dotenv

Style
ESLint: CS52’s ES6 and Node ESLint Configuration (Airbnb)

TypeScript: Not used (this project uses plain JavaScript)

Data Models
User
Users are sourced from a static JSON file provided for the challenge.

Each user includes name, GitHub handle, and profile metadata.

Nap
A nap is an entry from the dali_naps Slack channel.

Each nap is sent to the OpenAI API, which returns a short poem in response.

Storage: All data is stored in MongoDB Atlas.

Directory Structure
bash
Copy
Edit
.
├── src
│   └── controllers/      # Request handlers
│   └── models/           # Mongoose models and database connections
│   └── services/         # Poem generation, data processing
│   └── routes.js         # All route endpoints
│   └── server.js         # Application entry point
├── .env                  # Environment variables
├── package.json
└── ...
Setup Instructions
Clone the repository and install dependencies:
Clone the repository and install dependencies:

bash
Copy
Edit
git clone https://github.com/fruityysocks/backendDaliAppl.git
cd backendDaliAppl
npm install
Create a MongoDB Atlas database.

Create a .env file in the root directory. Follow the format in .env.example.

Run the development server:

bash
Copy
Edit
npm run dev

Available Scripts
npm run dev – Start the development server with hot reloading

npm start – Run the server in production mode

npm run lint – Run ESLint using the CS52 configuration

Deployment
Platform: Render

Base URL: https://backenddaliappl.onrender.com/api

To re-deploy:
Push changes to the main branch.

Render will not automatically rebuild and deploy the latest code.

Confirm deployment through the Render dashboard.

Authors
Prishita Dharampal '28 – Developer

Eric Lu '25 – Template credit

Acknowledgments
Special thanks to the DALI Lab for providing the project challenge and design direction.

Template credits to Eric Lu '25. Additional credit to Adam McQuilkin '22, Ziray Hao '22, Jack Keane '22, and Thomas Monfre '21 for developing the original DALI CRUD Template Backend.