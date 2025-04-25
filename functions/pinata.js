const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Replace these with your actual Pinata API keys
const PINATA_API_KEY = 'YOUR_PINATA_API_KEY';
const PINATA_SECRET_API_KEY = 'YOUR_PINATA_SECRET_API_KEY';

const pinFileToIPFS = async (filePath) => {
  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
    maxBodyLength: 'Infinity',
    headers: {
      ...data.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY
    }
  });

  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
};

const pinJSONToIPFS = async (json) => {
  const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', json, {
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY
    }
  });
  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
};

module.exports = { pinFileToIPFS, pinJSONToIPFS }; 