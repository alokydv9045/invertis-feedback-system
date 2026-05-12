import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function drop() {
  await mongoose.connect(MONGO_URI);
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped.');
  process.exit(0);
}
drop();
