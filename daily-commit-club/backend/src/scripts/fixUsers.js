import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/User.js';

async function fixUsers() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing');
  }
  await mongoose.connect(mongoUri);
  const users = await User.find({});
  for (const u of users) {
    let username = (u.githubUsername || '').trim().replace(/\s+/g, '-');
    if (!username) username = 'dev-user';
    let url = u.githubUrl || `https://github.com/${username}`;
    await User.updateOne(
      { _id: u._id },
      { $set: { githubUsername: username, githubUrl: url } }
    );
  }
  const updated = await User.find({});
  console.log('Sanitized users in MongoDB:', updated.map(u => ({ id: u._id, name: u.name, username: u.githubUsername, url: u.githubUrl })));
  mongoose.disconnect();
  process.exit(0);
}

fixUsers().catch(console.error);
