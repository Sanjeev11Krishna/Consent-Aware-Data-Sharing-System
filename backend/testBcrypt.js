const bcrypt = require('bcryptjs');

// Test bcrypt comparison with the stored hash
const storedHash = '$2b$10$CAP7xgP6VrL9ayfMM4xvueUkA4bPc7/1hPerpRgSyExhtVrzj9lRq';

async function testPassword() {
  try {
    // Test with a few common passwords
    const testPasswords = ['password', '123456', 'test123', 'admin123'];
    
    for (const password of testPasswords) {
      const isMatch = await bcrypt.compare(password, storedHash);
      console.log(`Password "${password}" matches: ${isMatch}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing password:', error);
    process.exit(1);
  }
}

testPassword();