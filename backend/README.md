## Backend API (Node.js + Express + MongoDB Atlas)

This backend powers your trading journal app with **MongoDB Atlas**, **email/password auth**, **forgot/reset password**, and **Google OAuth-style login endpoint**, plus all the trade and AI routes your frontend already uses.

### 1. Install dependencies

From the project root:

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file in `backend` with at least:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<dbName>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-random-secret
CLIENT_URL=http://localhost:5173
PORT=4000
```

You can get `MONGODB_URI` from **MongoDB Atlas** (create a database user and cluster, then copy the connection string).

### 3. Run the backend in development

```bash
cd backend
npm run dev
```

The API will start on `http://localhost:4000`.

### 4. Important routes

- **Auth**
  - `POST /api/auth/register` – create user (`{ email, password, name }`)
  - `POST /api/auth/login` – login (`{ email, password }`), returns JWT + user
  - `POST /api/auth/forgot-password` – send reset link (logs link to server console)
  - `POST /api/auth/reset-password` – reset password (`{ email, token, password }`)

- **Trades** (all require `Authorization: Bearer <token>`)
  - `GET /api/trades` – list current user trades
  - `GET /api/trades/:id` – get single trade
  - `POST /api/trades` – create trade
  - `PUT /api/trades/:id` – update trade
  - `DELETE /api/trades/:id` – delete trade
  - `POST /api/trades/:id/journal` – update `postExitJournal`
  - `GET /api/trades/:id/similar` – similar trades (instrument/emotions based)

- **AI (mocked)**
  - `POST /api/ai/analyze` – returns mock `AIAnalysisResponse` for given trades
  - `POST /api/ai/parse` – returns mock decision graph

- **Upload (mocked)**
  - `POST /api/upload` – returns a fake image URL (no real storage yet)

### 5. Hooking the frontend to this backend

In your frontend `.env` (Vite), set:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

Then restart the frontend dev server so it starts calling this backend instead of the MSW mocks.


