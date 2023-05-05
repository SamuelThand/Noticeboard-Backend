import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import expressSession, { SessionOptions } from 'express-session';
// TODO import routes
import testRoutes from './routes/tests';
import userRoutes from './routes/users';

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

declare module 'express-session' {
  export interface Session {
    user?: any;
    isAdmin?: boolean;
  }
}

// TODO uppdatera
const allowedOrigins = ['http://localhost:4200', 'https://studenter.miun.se'];

// TODO better security
const corsOptions = {
  credentials: true,
  origin: allowedOrigins
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse incoming JSON payloads with express.json
app.use(express.urlencoded({ extended: true })); // Parse incoming requests with urlencoded payloads using express.urlencoded

// TODO better security
const session: SessionOptions = {
  secret: process.env.SECRET_KEY!,
  resave: false,
  saveUninitialized: true,
  rolling: true, // TODO: review
  cookie: {
    sameSite: true,
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 30 // 30 minutes
  }
};

// TODO review security
if (process.env.NODE_ENV === 'production') {
  console.log('setting as production');
  app.set('trust proxy', 1);
  if (session.cookie !== undefined) {
    session.cookie.sameSite = 'none';
    session.cookie.secure = true;
  }
}

app.use(expressSession(session));

// TODO use routes, remove test route before production
app.use('/tests', testRoutes);
app.use('/users', userRoutes);

mongoose
  .connect(process.env.DB_SERVER!)
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => {
    console.log('db error', error);
    process.exit(1);
  });

// Start the server
app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
