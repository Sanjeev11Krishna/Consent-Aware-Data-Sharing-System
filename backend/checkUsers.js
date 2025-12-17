const User = require('./models/User');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Check users
setTimeout(async () => {
  try {
    const users = await User.find({});
    console.log('Users in database:', users);
    process.exit(0);
  } catch (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
}, 1000);