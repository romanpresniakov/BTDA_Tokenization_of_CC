import React, { useState } from "react";
import mockRegistry from "./mockRegistry.json";

export default function MintPage({ contract, loading, setLoading, error, setError, walletAddress }) {
  const [projectId, setProjectId] = useState("");
  const [ipfsCID, setIpfsCID] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Find registry entry based on input
  const registryEntry = mockRegistry.find(entry => entry.projectId === projectId);

  const handleProjectIdChange = e => {
    setProjectId(e.target.value);
    setShowDetails(false);
    setSuccessMsg("");
    setError("");
  };

  const handleIpfsCIDChange = e => {
    setIpfsCID(e.target.value);
    setSuccessMsg("");
    setError("");
  };

  const handleShowDetails = () => {
    setShowDetails(true);
    setError("");
  };

  const handleBatchMint = async e => {
    e.preventDefault();
    setSuccessMsg("");
    setError("");
    setLoading(true);

    try {
      if (!contract) throw new Error("Smart contract not ready.");
      if (!registryEntry) throw new Error("Project ID not found in registry.");

      // Check on-chain: already bridged?
      const alreadyBridged = await contract.bridgedProjectIds(registryEntry.projectId);
      if (alreadyBridged) throw new Error("This project has already been bridged!");

      // Create project with registry metadata
      const createTx = await contract.createProject(
        registryEntry.projectId,
        ipfsCID,
        registryEntry.location,
        registryEntry.projectName
      );
      await createTx.wait();

      // Get new projectId (projectCounter - 1)
      const projectCounter = await contract.projectCounter();
      const onchainProjectId = Number(projectCounter) - 1;

      // Batch mint (amount from registry)
      const mintTx = await contract.mintBatch(walletAddress, onchainProjectId, registryEntry.amountRetired);
      await mintTx.wait();

      setSuccessMsg(`🎉 Bridged and minted ${registryEntry.amountRetired} NFT(s) for ${registryEntry.projectName}!`);
      setProjectId("");
      setIpfsCID("");
      setShowDetails(false);
    } catch (err) {
      setError(err.reason || err.message || "Batch minting failed.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="card shadow-sm p-4 mb-4" style={{ maxWidth: 500 }}>
      <div className="card-body">
        <h2 className="h4 mb-3">Bridge and Mint Carbon Offset Project</h2>

        {!contract && (
          <div className="alert alert-info py-2 mb-3">
            Connecting to blockchain... Please connect your wallet and wait.
          </div>
        )}

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}

        <form onSubmit={handleBatchMint}>
          <div className="mb-3">
            <label className="form-label fw-bold">Registry Project ID</label>
            <input
              className="form-control"
              type="text"
              name="projectId"
              value={projectId}
              onChange={handleProjectIdChange}
              placeholder="VCS-100001"
              required
              disabled={!contract}
              autoComplete="off"
            />
            <div className="form-text">
              Must match a projectId in the mock registry (case-sensitive).
            </div>
          </div>

          {registryEntry && (
            <>
              <div className="mb-3">
                <label className="form-label fw-bold">Project Name</label>
                <input
                  className="form-control"
                  type="text"
                  value={registryEntry.projectName}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Location</label>
                <input
                  className="form-control"
                  type="text"
                  value={registryEntry.location}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Amount (tons of CO₂)</label>
                <input
                  className="form-control"
                  type="number"
                  value={registryEntry.amountRetired}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              {registryEntry.retiredBy && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Retired By</label>
                  <input
                    className="form-control"
                    type="text"
                    value={registryEntry.retiredBy}
                    readOnly
                    tabIndex={-1}
                  />
                </div>
              )}
              {registryEntry.retiredDate && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Retired Date</label>
                  <input
                    className="form-control"
                    type="text"
                    value={registryEntry.retiredDate}
                    readOnly
                    tabIndex={-1}
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label fw-bold">IPFS CID</label>
                <input
                  className="form-control"
                  type="text"
                  name="ipfsCID"
                  value={ipfsCID}
                  onChange={handleIpfsCIDChange}
                  placeholder="bafy..."
                  required
                  disabled={!contract}
                />
                <div className="form-text">
                  Enter the IPFS CID for your project metadata or image.
                </div>
              </div>
            </>
          )}

          <button
            className="btn btn-success w-100"
            type="submit"
            disabled={
              loading ||
              !contract ||
              !registryEntry ||
              !ipfsCID
            }
          >
            {loading ? "Minting..." : "Mint Project NFTs"}
          </button>
        </form>
      </div>
    </div>
  );
}