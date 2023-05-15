import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import expressSession, { SessionOptions } from 'express-session';
import helmet from 'helmet';
import testRoutes from './routes/tests';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import path from 'path';
import https from 'https';
import fs from 'fs';

declare module 'express-session' {
  export interface Session {
    user?: any;
    isAdmin?: boolean;
  }
}
dotenv.config();

if (process.env.NODE_ENV === 'production') {
  setUpProduction();
} else {
  setUpDevelopment();
}

function setUpDevelopment() {
  const app = express();
  const port = process.env.PORT || 3000;

  // TODO HTTP development origins
  const allowedOrigins = ['http://localhost:4200'];

  const corsOptions = {
    credentials: true,
    origin: allowedOrigins
  };

  app.use(cors(corsOptions));
  app.use(express.json()); // Parse incoming JSON payloads with express.json
  app.use(express.urlencoded({ extended: true })); // Parse incoming requests with urlencoded payloads using express.urlencoded

  // https://bit.ly/3LAEsH8
  const session: SessionOptions = {
    secret: process.env.SECRET_KEY!, // https://bit.ly/3nFIxBI
    resave: false,
    saveUninitialized: false,
    rolling: true, // Updates max age of session upon requests
    cookie: {
      sameSite: true,
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 30 // 30 minutes, combined with 'rolling: true' kills inactive sessions
    }
  };

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"]
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

  mongoose
    .connect(process.env.DB_SERVER!)
    .then(() => {
      console.log('Database connected');
    })
    .catch((error) => {
      console.log('db error', error);
      process.exit(1);
    });

  app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
  });
}

function setUpProduction() {
  const app = express();
  const port = process.env.PORT || 8443; // TODO HTTPS production PORTS
  const privateKey = fs.readFileSync('server.key');
  const certificate = fs.readFileSync('server.cert');

  // TODO HTTPS production origins
  const allowedOrigins = ['https://10.55.102.33:8443'];

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
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 30 // 30 minutes, combined with 'rolling: true' kills inactive sessions
    }
  };
  console.log('setting as production');
  app.set('trust proxy', 1);

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
          imgSrc: ["'self'", 'https://ssl.gstatic.com'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrcAttr: ["'unsafe-inline'"],
          connectSrc: ["'self'", 'https://localhost:8443']
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

  // TODO Serve angular frontend, catch all other routes and return the index file from Angular
  app.use(
    express.static(
      path.join(
        __dirname,
        '../../dt167g-project-group6-frontend/dist/dt167g-project-group6-frontend'
      )
    )
  );
  app.get('*', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../../dt167g-project-group6-frontend/dist/dt167g-project-group6-frontend/index.html'
      )
    );
  });

  mongoose
    .connect(process.env.DB_SERVER!)
    .then(() => {
      console.log('Database connected');
    })
    .catch((error) => {
      console.log('db error', error);
      process.exit(1);
    });

  // TODO Start production HTTPS SERVER
  const server = https.createServer(
    {
      key: privateKey,
      cert: certificate
    },
    app
  );

  server.listen(port, function () {
    console.log(`Server is running on port ${port}`);
  });
}
