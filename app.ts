import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import expressSession, { SessionOptions } from 'express-session';
import helmet from 'helmet';
// TODO import routes
import testRoutes from './routes/tests';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import path from 'path';

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
// https://bit.ly/3LAEsH8
const session: SessionOptions = {
  secret: process.env.SECRET_KEY!, // https://bit.ly/3nFIxBI
  resave: false,
  saveUninitialized: false,

  // TODO: review

  rolling: true, // Updates max age of session upon requests
  cookie: {
    sameSite: true,
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 30 // 30 minutes, combined with 'rolling: true' kills inactive sessions
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

// TODO CSP config för hosting av hela appen
//
// problem med helmet configen, måste ha unsafe inline och
// tillåta gstatic bilder?
// Add Helmet middleware for production
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // imgSrc: ["'self'"],
        imgSrc: ["'self'", 'https://ssl.gstatic.com'],
        // scriptSrc: ["'self'"],
        // styleSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        connectSrc: ["'self'"]
      }
    },
    referrerPolicy: { policy: 'same-origin' }
  })
);

app.use(expressSession(session));

// TODO use routes, remove test route before production
app.use('/tests', testRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

// TODO Serve angular frontend
//
//
//
app.use(
  express.static(
    path.join(
      __dirname,
      '../../dt167g-project-group6-frontend/dist/dt167g-project-group6-frontend'
    )
  )
);

// Catch all other routes and return the index file from Angular
app.get('*', (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      '../../dt167g-project-group6-frontend/dist/dt167g-project-group6-frontend/index.html'
    )
  );
});
//
//
//
//

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
