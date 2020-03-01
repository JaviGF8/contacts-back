import express from 'express';
import env from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import conf from './config';
import setRoutes from './routes';

const app = express();
env.config({ path: `${__dirname}/.env` });
const port = 5000;

// DDBB Connection
mongoose.Promise = global.Promise;
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
};
const maxCalls = 10000;
mongoose.connect(`mongodb://${conf.mongo.uri}/${conf.mongo.db}`, options, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Connecting to Database at: ${conf.mongo.uri}/${conf.mongo.db}`);
});

mongoose.connection.on('error', (err) => {
  console.log('Could not connect to mongo server!');
  console.warn(err);
});

mongoose.connection.on('open', () => {
  console.log('Connected to mongo server.');
});

// Middlewares
app.use(
  cors({
    methods: [ 'GET', 'POST', 'PUT', 'DELETE' ],
  }),
);

app.use(
  morgan('combined', {
    skip(req) {
      return 'ELB-HealthChecker/2.0' === req.headers.origin;
    },
  }),
);

const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 10 minutes
  max: maxCalls, // limit each IP to 10000 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  headers: true,
});

app.use(limiter); // limit Api requests
app.use(helmet()); // protection

app.use((err, req, res, next) => {
  const userAgent = req.get('User-Agent');
  if ('ELB-HealthChecker/2.0' === userAgent) {
    res.sendStatus(200);
  } else {
    err.redirect = '/login';
    err.code = 401;
    res.status(401);
    res.send(err); // if error with token, send the error
  }
});

app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  const front = process.env.FRONTEND_URL;
  const allowedOrigins = [ 'ELB-HealthChecker/2.0', front ];
  const origin = req.headers.origin ? req.headers.origin : '';

  if (-1 < allowedOrigins.indexOf(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin); // if the req.header origin is allowed, add it to the header.
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next(); // eslint-disable-line
  } else if (origin.includes('http://localhost:')) {
    res.setHeader('Access-Control-Allow-Origin', origin); // if the req.header origin is allowed, add it to the header.
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next(); // eslint-disable-line
  } else if (-1 < origin.indexOf('http://')) {
    // do not allow since it is http
    const err = {};
    err.code = 403;
    err.message = 'This is a non secure connection';
    res.status(403);
    res.send(err);
  } else if (!req.headers.origin) {
    // no origin header present
    const err = {};
    err.code = 403;
    err.message = 'No Origin Header Present.';
    res.status(403);
    res.send(err);
  } else {
    // wrong origin
    const err = {};
    err.code = 403;
    err.message = 'Wrong origin header.';
    res.status(403);
    res.send(err);
  }
});

const router = express.Router();

// Index
router.get('/', (req, res) => {
  res.send('Contacts backend');
});

app.use(router);

// Iniciar servido
app.listen(port, () => {
  console.log(`Node server running on http://localhost:${port}`);
});

setRoutes(app);
