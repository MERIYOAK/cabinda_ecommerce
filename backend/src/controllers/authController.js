const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug logging
    console.log('Login attempt:', { email, adminEmail: process.env.ADMIN_EMAIL });
    
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASSWORD || !process.env.JWT_SECRET) {
      console.error('Missing required environment variables for authentication');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify credentials against environment variables
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_EMAIL_PASSWORD) {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: process.env.ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login successful for:', email);

    // Return token
    res.json({
      message: 'Login successful',
      token,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login
}; 