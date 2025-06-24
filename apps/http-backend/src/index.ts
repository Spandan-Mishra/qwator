import express from "express";
import userRouter from './routes/user';
import voterRouter from './routes/voter';
import { createClient } from '@supabase/supabase-js'
import { config } from "dotenv";
import cors from "cors";

config();
const app = express();
export const supabase = createClient(
  process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co', 
  process.env.SUPABASE_ANON_KEY || 'public-anon-key'
);

app.use(express.json());
app.use(cors());

app.use('/api/user', userRouter);
app.use('/api/voter', voterRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});