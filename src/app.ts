import express, {Request, Response} from 'express';

const app = express();

app.get('/health',(_req:Request,res:Response)=>{
    return res.status(200).send("OK")
});

export default app 