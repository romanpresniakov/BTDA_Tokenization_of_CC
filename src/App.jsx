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
                contract={contract} // <-- THIS IS THE FIX!
                walletAddress={walletAddress}
                // You can still pass other props if you use them
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}