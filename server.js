// ========================================
// PDF Manager - UAS PBO
// Backend Developer: Dini Prihartini
// Fitur: REST API untuk CRUD file PDF
// ========================================
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Hanya file PDF yang diizinkan!'));
  }
});

app.get('/api/files', (req, res) => {
  const files = fs.readdirSync('uploads').map(filename => ({
    filename,
    originalName: filename.replace(/^\d+-/, ''),
    size: fs.statSync(`uploads/${filename}`).size,
    uploadedAt: fs.statSync(`uploads/${filename}`).birthtime
  }));
  res.json(files);
});

app.post('/api/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file!' });
  res.json({ message: 'Upload berhasil!', file: req.file });
});

app.delete('/api/files/:filename', (req, res) => {
  const filepath = path.join('uploads', req.params.filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File tidak ditemukan!' });
  fs.unlinkSync(filepath);
  res.json({ message: 'File berhasil dihapus!' });
});

app.put('/api/files/:filename', (req, res) => {
  const { newName } = req.body;
  const oldPath = path.join('uploads', req.params.filename);
  const timestamp = req.params.filename.split('-')[0];
  const newPath = path.join('uploads', `${timestamp}-${newName}.pdf`);
  if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'File tidak ditemukan!' });
  fs.renameSync(oldPath, newPath);
  res.json({ message: 'File berhasil diubah namanya!' });
});

app.listen(PORT, () => console.log(`✅ Server berjalan di http://localhost:${PORT}`));