const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Create directories if they don't exist
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(publicDir, 'uploads');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF)'));
    }
  }
});

// Database setup
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'clickfit',
  waitForConnections: true,
  connectionLimit: 10
});

// Middleware
app.use(express.static(publicDir));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.post('/api/upload', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ success: true, files: fileUrls });
    
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Database initialization
async function initDB() {
  try {
    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL UNIQUE,
        password VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL,
        type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL,
        active TINYINT DEFAULT 1
      )
    `);
    
    await conn.query(`
      DELIMITER //
      CREATE PROCEDURE IF NOT EXISTS addUser(
        IN p_email VARCHAR(255),
        IN p_password VARCHAR(255),
        IN p_type VARCHAR(255)
      BEGIN
        INSERT INTO users (email, password, type) 
        VALUES (p_email, p_password, p_type);
      END //
      DELIMITER ;
    `);

    console.log('Database initialized');
    conn.release();
  } catch (err) {
    console.error('Database init failed:', err);
  }
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initDB();
});