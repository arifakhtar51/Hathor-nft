import './NFTGrid.css';

const NFTGrid = ({ nfts }) => {
  if (!nfts || nfts.length === 0) {
    return (
      <div className="info">
        No NFTs minted yet. Start by minting your first NFT!
      </div>
    );
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="nft-grid">
      {nfts.map(nft => (
        <div key={nft.id} className="nft-card">
          <img
            src={nft.imageURL}
            alt={nft.name}
            className="nft-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
            }}
          />
          <div className="nft-info">
            <div className="nft-title">{nft.name}</div>
            <div className="nft-description">{nft.description}</div>
            <div className="nft-links">
              <a href={nft.imageURL} target="_blank" rel="noopener noreferrer">
                View Image
              </a>
              <a href={nft.metadataURL} target="_blank" rel="noopener noreferrer">
                View Metadata
              </a>
            </div>
            <button
              className="copy-button"
              onClick={() => copyToClipboard(nft.metadataURL)}
            >
              Copy Metadata URL
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NFTGrid; 