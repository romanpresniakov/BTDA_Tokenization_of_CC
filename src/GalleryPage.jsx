import React, { useMemo } from "react";

export default function GalleryPage({ tokens, loadMetadata, retireToken, metadata, walletAddress }) {
  // Case-insensitive, trimmed comparison
  const userTokens = useMemo(
    () =>
      walletAddress
        ? tokens.filter(
            token =>
              token.owner &&
              token.owner.toLowerCase().trim() === walletAddress.toLowerCase().trim()
          )
        : [],
    [tokens, walletAddress]
  );

  const otherTokens = useMemo(
    () =>
      walletAddress
        ? tokens.filter(
            token =>
              token.owner &&
              token.owner.toLowerCase().trim() !== walletAddress.toLowerCase().trim()
          )
        : tokens,
    [tokens, walletAddress]
  );

  return (
    <div className="mb-5">
      {/* Debug: show addresses */}
      <div className="mb-2 text-muted small">
        <div>My address: <code>{walletAddress || "(not connected)"}</code></div>
        <div>First token owner: <code>{tokens[0]?.owner}</code></div>
      </div>

      {/* Headline for user's own NFTs */}
      <h2 className="h4 mt-4 mb-3">Your Carbon NFTs</h2>
      {userTokens.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
          {userTokens.map(token => (
            <div className="col" key={token.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Token #{token.id}</h5>
                  <p className="card-text small mb-1"><strong>Status:</strong> {token.retired ? "Retired" : "Active"}</p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => loadMetadata(token.id)}>
                      View
                    </button>
                    {!token.retired && (
                      <button className="btn btn-danger btn-sm" onClick={() => retireToken(token.id)}>
                        Retire
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted mb-5">You don’t own any Carbon NFTs yet.</div>
      )}

      {/* Headline for all NFTs */}
      <h2 className="h4 mt-4 mb-3">All Carbon NFTs</h2>
      {otherTokens.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {otherTokens.map(token => (
            <div className="col" key={token.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Token #{token.id}</h5>
                  <p className="card-text small mb-1"><strong>Owner:</strong> {token.owner.slice(0, 6)}...{token.owner.slice(-4)}</p>
                  <p className="card-text mb-2"><strong>Status:</strong> {token.retired ? "Retired" : "Active"}</p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => loadMetadata(token.id)}>
                      View
                    </button>
                    {!token.retired && (
                      <button className="btn btn-danger btn-sm" onClick={() => retireToken(token.id)}>
                        Retire
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted">No other Carbon NFTs found.</div>
      )}

      {/* Metadata card, unchanged */}
      {metadata && (
        <div className="card mt-5">
          <div className="card-body">
            <h4 className="card-title">Token #{metadata.id} Metadata</h4>
            <p><strong>IPFS CID:</strong> {metadata.ipfsCID}</p>
            <p><strong>Location:</strong> {metadata.location}</p>
            <p><strong>Project Name:</strong> {metadata.projectName}</p>
            {metadata.offchain?.image && (
              <img
                src={metadata.offchain.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                alt="NFT"
                style={{ maxWidth: "200px", borderRadius: "8px" }}
                className="mb-2"
              />
            )}
            {metadata.offchain?.description && (
              <p className="mt-2"><strong>Description:</strong> {metadata.offchain.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

