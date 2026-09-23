import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/User.js';

async function fixUsers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/daily_commit_club');
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
