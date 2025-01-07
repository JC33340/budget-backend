import { Request, Response } from 'express';
import app from './config/express.config';
import {
  convertError,
  handleError,
  endpointNotFound
} from './middleware/error.middleware';

app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).send('OK');
});

//routes


//errors placed at the bottom of the stack, to ensure that it is a global catch
app.use(convertError);

app.use(endpointNotFound);

app.use(handleError)

export default app;
