import express from "express";
import userRouter from './routes/user';
import voterRouter from './routes/voter';

const app = express();

app.use('/api/user', userRouter);
app.use('/api/voter', voterRouter);