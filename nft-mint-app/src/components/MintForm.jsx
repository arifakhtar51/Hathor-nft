import { useState } from 'react';
import './MintForm.css';

const MintForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    seed: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Temporary hardcoded credentials for testing
  const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5OTMyNjE0OC1hMzIzLTQ0YzItYjUwNi00MTU0YTNiMTNmMzMiLCJlbWFpbCI6ImFyaWZha2h0YXI5MDJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkNTJmNTMxNzM3OGY1YThjZWVlIiwic2NvcGVkS2V5U2VjcmV0IjoiYjFkOTlkNjY3ODc1MTRhMmY2ZGE5Nzk0YWI1YjEyZmY4MWExY2EzMWNkMThhYjM5NjYyMDYzNTQ4ZmIzNDE1MSIsImV4cCI6MTc3NzEwMjMyNX0.GwMhqGhugqTEYpyIVSzsZmflRAZOy39RG4HdgwFLYcA';
  const PINATA_API_KEY = '3d52f5317378f5a8ceee';
  const PINATA_API_SECRET = 'b1d99d66787514a2f6da9794ab5b12ff81a1ca31cd18ab39662063548fb34151';

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First, upload the image to Pinata
      const imageFormData = new FormData();
      imageFormData.append('file', formData.image);

      const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET
        },
        body: imageFormData
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(`Failed to upload image to IPFS: ${errorData.error || imageResponse.statusText}`);
      }

      const imageData = await imageResponse.json();
      const imageHash = imageData.IpfsHash;

      // Create metadata JSON
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        attributes: [
          {
            trait_type: "Seed",
            value: formData.seed
          }
        ]
      };

      // Upload metadata to Pinata
      const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET
        },
        body: JSON.stringify(metadata)
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error(`Failed to upload metadata to IPFS: ${errorData.error || metadataResponse.statusText}`);
      }

      const metadataData = await metadataResponse.json();
      const metadataHash = metadataData.IpfsHash;

      setSuccess({
        message: 'NFT minted successfully!',
        hash: metadataHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`
      });
      setFormData({
        name: '',
        description: '',
        seed: '',
        image: null
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mint-container">
      <form onSubmit={handleSubmit} className="mint-form">
        <div className="form-group">
          <label htmlFor="name">NFT Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter NFT name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter NFT description"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="seed">Seed Phrase</label>
          <input
            type="text"
            id="seed"
            name="seed"
            value={formData.seed}
            onChange={handleChange}
            placeholder="Enter your seed phrase"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">NFT Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Upload to IPFS'}
        </button>

        {error && <div className="error">{error}</div>}
      </form>

      {success && (
        <div className="success-card">
          <div className="success-header">
            <h3>🎉 NFT Minted Successfully!</h3>
          </div>
          <div className="success-content">
            <img src={success.imageUrl} alt="Minted NFT" className="minted-image" />
            <div className="success-details">
              <p><strong>IPFS Hash:</strong></p>
              <p className="hash">{success.hash}</p>
              <p><strong>View on IPFS:</strong></p>
              <a 
                href={`https://gateway.pinata.cloud/ipfs/${success.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ipfs-link"
              >
                Open in IPFS Gateway
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MintForm; 