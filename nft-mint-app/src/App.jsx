import { useState } from 'react';
import './App.css';
import MintForm from './components/MintForm';
import Guide from './components/Guide';

function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>NFT Minting Platform</h1>
        <p>Create and manage your NFTs with ease</p>
      </header>

      <div className="main-content">
        <div className="mint-section">
          <h2>Mint New NFT</h2>
          <MintForm />
        </div>
      </div>

      <Guide />
    </div>
  );
}

export default App; 