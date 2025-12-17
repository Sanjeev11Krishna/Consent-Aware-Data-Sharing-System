const User = require('./models/User');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Find user
setTimeout(async () => {
  try {
    // Try to find user
    const user = await User.findOne({ email: 'sk338567@gmail.com' });
    if (user) {
      console.log('User found:');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Password hash:', user.password);
      console.log('Personal Info:', user.personalInfo);
    } else {
      console.log('User not found');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error finding user:', error);
    process.exit(1);
  }
}, 1000);