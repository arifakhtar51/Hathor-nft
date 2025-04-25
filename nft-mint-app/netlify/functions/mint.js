const axios = require('axios');
require('dotenv').config();

// Mock data for demonstration
const mockNFTs = [
  {
    id: 1,
    name: "NFT #1",
    image: "https://via.placeholder.com/150",
    description: "First NFT in the collection"
  },
  {
    id: 2,
    name: "NFT #2",
    image: "https://via.placeholder.com/150",
    description: "Second NFT in the collection"
  }
];

exports.handler = async (event, context) => {
  try {
    // Pinata API endpoint for fetching pinned items
    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      }
    });

    // Transform Pinata response to NFT format
    const nfts = response.data.rows.map(item => ({
      id: item.id,
      name: item.metadata.name || `NFT #${item.id}`,
      image: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
      description: item.metadata.keyvalues?.description || 'No description available'
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(nfts)
    };
  } catch (error) {
    console.error('Error fetching from Pinata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch NFTs from Pinata' })
    };
  }
}; 