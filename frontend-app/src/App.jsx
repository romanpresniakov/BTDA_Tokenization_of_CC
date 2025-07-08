import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MintPage from "./MintPage";
import GalleryPage from "./GalleryPage";
import AppWrapper from "./AppWrapper";

export default function App() {
  const {
    contract,
    signer,
    projects,
    tokens,
    metadata,
    loadMetadata,
    loading,
    setLoading,
    error,
    setError,
    walletAddress,
    walletConnected,
    connectWallet,    // <--- ADD THIS!
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
        
        {/* CONNECT WALLET BUTTON - only if not connected */}
        {!walletConnected && (
          <div className="mb-4 text-center">
            <button className="btn btn-warning btn-lg" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        )}

        {/* Show wallet address if connected */}
        {walletConnected && walletAddress && (
          <div className="mb-4 text-center" style={{fontSize: "1rem"}}>
            Connected as <span className="badge bg-secondary">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <MintPage
                contract={contract}
                signer={signer}
                loading={loading}
                setLoading={setLoading}
                error={error}
                setError={setError}
                walletAddress={walletAddress}
              />
            }
          />
          <Route
            path="/gallery"
            element={
              <GalleryPage
                contract={contract}
                walletAddress={walletAddress}
                // Add more props if needed
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}