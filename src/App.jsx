import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MintPage from "./MintPage";
import GalleryPage from "./GalleryPage";
import AppWrapper from "./AppWrapper";

export default function App() {
  const {
    contract,
    signer,
    tokens,
    metadata,
    mintNFT,
    mintData,
    setMintData,
    loadMetadata,
    retireToken,
    loading,
    error,
    walletAddress, // <--- Make sure you have this from AppWrapper or however you store the connected wallet address
  } = AppWrapper();

  return (
    <Router>
      <div className="container py-4 min-vh-100 bg-white" style={{ fontSize: "1.15rem" }}>
        {/* Headline */}
        <h1 className="display-4 mb-4 text-center">Carbon NFT Bridge</h1>
        <nav className="d-flex justify-content-center align-items-start pt-2 pb-4 gap-2">
          <Link to="/" className="btn btn-primary btn-lg" style={{ minWidth: "120px" }}>Mint</Link>
          <Link to="/gallery" className="btn btn-primary btn-lg" style={{ minWidth: "120px" }}>Gallery</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <MintPage
                contract={contract}
                signer={signer}
                mintNFT={mintNFT}
                mintData={mintData}
                setMintData={setMintData}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/gallery"
            element={
              <GalleryPage
                tokens={tokens}
                loadMetadata={loadMetadata}
                retireToken={retireToken}
                metadata={metadata}
                walletAddress={walletAddress}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
