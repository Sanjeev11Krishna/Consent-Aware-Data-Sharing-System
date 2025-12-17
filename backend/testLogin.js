const User = require('./models/User');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Test login
setTimeout(async () => {
  try {
    // Try to find user and check password
    const user = await User.findOne({ email: 'sk338567@gmail.com' });
    console.log('User found:', user.email);
    
    // Test password comparison
    const isMatch = await user.comparePassword('testpassword');
    console.log('Password match:', isMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
}, 1000);