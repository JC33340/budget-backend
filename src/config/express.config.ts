import express, { Express } from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';

const app:Express = express();

//cors config
app.use(cors())

//parse body
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//compression
app.use(compression());

//helmet
app.use(helmet());

export default app