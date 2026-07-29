const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const existing = await User.findOne({ email: 'admin@memoverse.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    name: 'Admin',
    email: 'admin@memoverse.com',
    password: 'admin123',
    role: 'admin',
    bio: 'MemoVerse Administrator'
  });

  console.log('Admin created:');
  console.log('  Email:    admin@memoverse.com');
  console.log('  Password: admin123');
  process.exit(0);
};

seed();
