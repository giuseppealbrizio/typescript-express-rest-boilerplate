import compression from 'compression';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import xss from 'xss-clean';
import { currentUser } from './middlewares/shared'; // replace shared library
import { stream } from './utils/logger.utils';

import mongoDbConfig from './config/mongodb.config';

import errorHandler from './middlewares/errorHandler.middleware';
import { NotFoundError } from './errors';

import v1Routes from './routes/v1/index.route';

// global env variables definition
dotenv.config();

// Call MongoDB connection based on NODE_ENV and return DB name
if (process.env.NODE_ENV === 'production') {
  mongoDbConfig.MongoDB().catch((err) => console.log(err));
} else {
  mongoDbConfig.MongoDBTest().catch((err) => console.log(err));
}

const app = express();

// set trust proxy to true to allow connections from localhost
app.set('trust proxy', true);

// define how morgan should log
app.use(morgan('combined', { stream }));

// set security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false, // prevent bug in new browsers
  }),
);

// parse json request body
app.use(express.json());

// arse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request body
app.use(xss());

// mongo sanitize
app.use(mongoSanitize());

// GZIP compression
app.use(compression());

// cookie parser
app.use(cookieParser());

// cookie policy for CORS
const DEFAULT_ENV = process.env.NODE_ENV || 'development';
const COOKIE_MAX_AGE = process.env.COOKIE_MAX_AGE || 1000 * 60 * 60 * 24;
const SECRET = process.env.JWT_KEY || 'your_jwt_secret';

app.use(
  session({
    cookie: {
      secure: DEFAULT_ENV === 'production',
      maxAge: <number>COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
    },
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    /* Store session in mongodb */
    store: MongoStore.create({
      autoRemove: 'native', // Default
      mongoUrl:
        process.env.NODE_ENV === 'production'
          ? process.env.MONGO_URI
          : process.env.MONGO_URI_TEST,
    }),
    unset: 'destroy',
  }),
);

// custom authentication middleware used to check if user is logged in
app.use(currentUser);

/**
 * Initialize Passport and pass the session to session storage of express
 * Strategies are called in the auth router
 * and in ./src/services/passport
 */
app.use(passport.initialize());
app.use(passport.session());

// CORS policy configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*', // allow CORS
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // allow session cookie from browser to pass through
  }),
);

// header configuration
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL); // Update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

/**
 * This MIDDLEWARE is to serve the public client build and redirect everything
 * to the client index.html. Replace the original one with public. Move build
 * inside the server folder and activate also the catchall middleware.
 */
// app.use(
//   express.static(path.join(__dirname, '../public'), {
//     index: 'index.html',
//   }),
// );

// Routes definition
app.use(`/api/v1/${process.env.SERVICE_NAME}`, v1Routes);

/**
 * Catchall middleware. Activate to serve every route in
 * the public directory i.e. if we have a build of React
 */
// app.use((req, res) =>
//   res.sendFile(path.resolve(path.join(__dirname, '../public/index.html'))),
// );

// API middleware that return 404 if route not found
app.all('*', () => {
  throw new NotFoundError('Resource not found on this server');
});

app.use(errorHandler);

export default app;
