const express = require('express');
const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { pinFileToIPFS, pinJSONToIPFS } = require('./pinata');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 if 3000 is taken

// Enable CORS for all routes
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
}

// Store minted NFTs in memory (you might want to use a database in production)
const mintedNFTs = [];

// API Routes
app.get('/api/nfts', (req, res) => {
  console.log('Fetching NFTs...');
  res.json(mintedNFTs);
});

app.post('/api/mint', (req, res) => {
  console.log('Received mint request');
  
  const form = new IncomingForm({
    uploadDir: uploadsDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024 // 10MB limit
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: '❌ Error processing form: ' + err.message });
    }

    try {
      console.log('Form fields:', fields);
      console.log('Form files:', files);

      if (!files.image || !files.image[0]) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      const { name, description, seed } = fields;
      const imagePath = files.image[0].filepath;

      console.log('Processing image:', imagePath);

      // 1. Upload image to IPFS
      console.log('Uploading to IPFS...');
      const imageURL = await pinFileToIPFS(imagePath);
      console.log('Image uploaded to IPFS:', imageURL);

      // 2. Upload metadata to IPFS
      const metadata = {
        name: name[0],
        description: description[0],
        image: imageURL,
        seed: seed[0],
        mintedAt: new Date().toISOString()
      };
      console.log('Uploading metadata to IPFS...');
      const metadataURL = await pinJSONToIPFS(metadata);
      console.log('Metadata uploaded to IPFS:', metadataURL);

      // 3. Store NFT information
      const nft = {
        id: Date.now().toString(),
        name: name[0],
        description: description[0],
        imageURL,
        metadataURL,
        seed: seed[0],
        mintedAt: new Date().toISOString()
      };
      mintedNFTs.push(nft);

      // Clean up uploaded file
      try {
        fs.unlinkSync(imagePath);
        console.log('Cleaned up uploaded file');
      } catch (cleanupErr) {
        console.warn('Error cleaning up file:', cleanupErr);
      }

      res.json({ 
        message: `✅ NFT Minted Successfully!`,
        nft
      });
    } catch (e) {
      console.error('Error in minting process:', e);
      res.status(500).json({ message: '❌ Error minting NFT: ' + e.message });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error: ' + err.message });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
}); 
