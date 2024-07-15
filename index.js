const app = require('./app');
const connectwithDB = require('./config/db');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Connect to database
connectwithDB();

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT} ...`);
});