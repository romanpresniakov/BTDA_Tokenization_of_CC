import React from "react";

export default function MintPage({ contract, signer, mintNFT, mintData, setMintData, loading, error }) {
  return (
    <div className="card shadow-sm p-4 mb-4" style={{ maxWidth: 500 }}>
      <div className="card-body">
        <h2 className="h4 mb-3">Mint Carbon NFT</h2>
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="mb-3">
          <label className="form-label fw-bold">IPFS CID</label>
          <input
            className="form-control"
            type="text"
            value={mintData.ipfsCID}
            onChange={e => setMintData({ ...mintData, ipfsCID: e.target.value })}
            placeholder="bafy..."
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Location</label>
          <input
            className="form-control"
            type="text"
            value={mintData.location}
            onChange={e => setMintData({ ...mintData, location: e.target.value })}
            placeholder="Peru"
          />
        </div>
        <div className="mb-4">
          <label className="form-label fw-bold">Project Name</label>
          <input
            className="form-control"
            type="text"
            value={mintData.projectName}
            onChange={e => setMintData({ ...mintData, projectName: e.target.value })}
            placeholder="Rainforest Offset 2025"
          />
        </div>
        <button
          className="btn btn-success w-100"
          onClick={mintNFT}
          disabled={loading || !mintData.ipfsCID || !mintData.location || !mintData.projectName}
        >
          {loading ? "Minting..." : "Mint"}
        </button>
      </div>
    </div>
  );
}
