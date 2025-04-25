const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');
const { pinFileToIPFS, pinJSONToIPFS } = require('./pinata');

// Store minted NFTs in memory (you might want to use a database in production)
const mintedNFTs = [];

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mintedNFTs)
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const form = new IncomingForm({
        uploadDir: '/tmp',
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024 // 10MB limit
      });

      const [fields, files] = await form.parse(event.body);
      console.log('Form fields:', fields);
      console.log('Form files:', files);

      if (!files.image || !files.image[0]) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: 'No image file uploaded' })
        };
      }

      const { name, description, seed } = fields;
      const imagePath = files.image[0].filepath;

      // 1. Upload image to IPFS
      const imageURL = await pinFileToIPFS(imagePath);

      // 2. Upload metadata to IPFS
      const metadata = {
        name: name[0],
        description: description[0],
        image: imageURL,
        seed: seed[0],
        mintedAt: new Date().toISOString()
      };
      const metadataURL = await pinJSONToIPFS(metadata);

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
      } catch (cleanupErr) {
        console.warn('Error cleaning up file:', cleanupErr);
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: `✅ NFT Minted Successfully!`,
          nft
        })
      };
    } catch (e) {
      console.error('Error in minting process:', e);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: '❌ Error minting NFT: ' + e.message })
      };
    }
  }
}; 