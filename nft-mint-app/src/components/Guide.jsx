import './Guide.css';

const Guide = () => {
  return (
    <div className="guide-section">
      <h2>Manual Minting Guide</h2>
      <p>After uploading your NFT to IPFS, follow these steps to complete the minting process:</p>
      
      <ol className="guide-steps">
        <li className="guide-step">
          <h3>Prepare Your Wallet</h3>
          <p>Make sure you have a Hathor wallet with some HTR tokens for gas fees.</p>
        </li>
        
        <li className="guide-step">
          <h3>Access Hathor Wallet</h3>
          <p>Open your Hathor wallet and navigate to the "Create Token" section.</p>
        </li>
        
        <li className="guide-step">
          <h3>Enter Token Details</h3>
          <p>Fill in the following details:</p>
          <ul>
            <li>Name: Use the same name as your NFT</li>
            <li>Symbol: Create a unique symbol (e.g., NFT001)</li>
            <li>Amount: 1 (for NFT)</li>
            <li>NFT Data: Paste the IPFS metadata URL</li>
          </ul>
        </li>
        
        <li className="guide-step">
          <h3>Complete Minting</h3>
          <p>Review all details and confirm the transaction. Wait for the transaction to be confirmed on the blockchain.</p>
        </li>
        
        <li className="guide-step">
          <h3>Verify Your NFT</h3>
          <p>After minting, you can verify your NFT on the Hathor Explorer using the transaction hash.</p>
        </li>
      </ol>
    </div>
  );
};

export default Guide; 