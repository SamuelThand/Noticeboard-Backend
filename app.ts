import express, { NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import expressSession, { SessionOptions } from 'express-session';
import helmet from 'helmet';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import path from 'path';
import https from 'https';
import fs from 'fs';
import { requestSpamLimiter } from './middleware/rateLimiter';

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

/**
 * Set up the environment for development.
 * HTTP and less strict rulesets.
 */
function setUpDevelopment() {
  const app = express();
  const port = process.env.PORT || 3000;
  const allowedOrigins = ['http://localhost:4200'];
  const corsOptions = {
    credentials: true,
    origin: allowedOrigins
  };

  app.use(cors(corsOptions));
  app.use(express.json()); // Parse incoming JSON payloads with express.json
  app.use(express.urlencoded({ extended: true })); // Parse incoming requests with urlencoded payloads using express.urlencoded

  const session: SessionOptions = {
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Updates max age of session upon requests
    name: 'session-id',
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

  app.use(requestSpamLimiter); // Set up rate limiter that acts as a safeguard agains DDOS.
  app.use(expressSession(session));
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

  app.use((req: express.Request, res: express.Response, next: NextFunction) => {
    res.status(404).send('Sorry, not found!');
  });

  // Custom error handler for reduced fingerprinting
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: NextFunction
    ) => {
      console.error(err.stack);
      res.status(500).send('Error!');
    }
  );

  app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
  });
}

/**
 * Set up the environment for production.
 * HTTPS and more strict rulesets.
 */
function setUpProduction() {
  const app = express();
  const port = process.env.PORT || 8443;
  const privateKey = fs.readFileSync('server.key');
  const certificate = fs.readFileSync('server.cert');

  const allowedOrigins = ['https://localhost:8443'];

  const corsOptions = {
    credentials: true,
    origin: allowedOrigins
  };

  app.use(cors(corsOptions));
  app.use(express.json()); // Parse incoming JSON payloads with express.json
  app.use(express.urlencoded({ extended: true })); // Parse incoming requests with urlencoded payloads using express.urlencoded

  const session: SessionOptions = {
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    name: 'session-id',

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

  app.use('/users', userRoutes);
  app.use('/posts', postRoutes);

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

  const server = https.createServer(
    {
      key: privateKey,
      cert: certificate
    },
    app
  );

  // Custom 404 handler for reduced fingerprinting
  app.use((req: express.Request, res: express.Response, next: NextFunction) => {
    res.status(404).send('Sorry, not found!');
  });

  // Custom error handler for reduced fingerprinting
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: NextFunction
    ) => {
      console.error(err.stack);
      res.status(500).send('Error!');
    }
  );

  server.listen(port, function () {
    console.log(`Server is running on port ${port}`);
  });
}
