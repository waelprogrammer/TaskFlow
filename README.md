# TaskFlow

A full-stack MERN task management application.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskflow
JWT_SECRET=your_secret_here
NODE_ENV=development
```

### 3. Run Development

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:5000

### 4. Production Build

```bash
cd client && npm run build
cd ../server && NODE_ENV=production npm start
```

## Deploy to Render

1. Create a new Web Service
2. Build command: `cd client && npm install && npm run build && cd ../server && npm install`
3. Start command: `cd server && npm start`
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| GET | /api/projects/:id/tasks | List tasks |
| POST | /api/projects/:id/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/tasks/stats | Dashboard stats |
