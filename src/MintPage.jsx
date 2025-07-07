import React, { useState } from "react";
import mockRegistry from "./mockRegistry.json";

export default function MintPage({ contract, loading, setLoading, error, setError, walletAddress }) {
  const [projectId, setProjectId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [alreadyBridged, setAlreadyBridged] = useState(false);

  // Find registry entry (NEW: using registryProjectId from registry)
  const registryEntry = mockRegistry.find(entry => String(entry.registryProjectId) === String(projectId));

  // Check on-chain if already bridged (if contract and registryEntry)
  React.useEffect(() => {
    let ignore = false;
    setAlreadyBridged(false);
    setSuccessMsg("");
    setError("");
    if (contract && registryEntry) {
      contract.bridgedProjectIds(registryEntry.registryProjectId)
        .then(res => { if (!ignore) setAlreadyBridged(res); })
        .catch(() => { if (!ignore) setAlreadyBridged(false); });
    }
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [contract, projectId, registryEntry]);

  const handleProjectIdChange = e => {
    setProjectId(e.target.value);
    setSuccessMsg("");
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
      if (alreadyBridged) throw new Error("This project has already been bridged!");

      // 1. Bridge the project (add to onchain projects)
      const createTx = await contract.createProject(
        registryEntry.registryProjectId,
        registryEntry.ipfsCID,
        registryEntry.location,
        registryEntry.projectName
      );
      await createTx.wait();

      // 2. Get the new projectId (projectCounter - 1)
      const projectCounter = await contract.projectCounter();
      const onchainProjectId = Number(projectCounter) - 1;

      // 3. Batch mint (amount from registry)
      const mintTx = await contract.mintBatch(walletAddress, onchainProjectId, registryEntry.amount);
      await mintTx.wait();

      setSuccessMsg(`🎉 Bridged and minted ${registryEntry.amount} NFT(s) for ${registryEntry.projectName}!`);
      setProjectId("");
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
              placeholder="1001"
              required
              disabled={!contract || loading}
              autoComplete="off"
            />
            <div className="form-text">
              Must match a <b>registryProjectId</b> in the registry.
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
                <label className="form-label fw-bold">Amount (tons of CO₂/NFTs)</label>
                <input
                  className="form-control"
                  type="number"
                  value={registryEntry.amount}
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
                <label className="form-label fw-bold">IPFS Metadata</label>
                <input
                  className="form-control"
                  type="text"
                  value={registryEntry.ipfsCID}
                  readOnly
                  tabIndex={-1}
                />
                <div className="form-text">
                  <a
                    href={`https://ipfs.io/ipfs/${registryEntry.ipfsCID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View metadata on IPFS
                  </a>
                </div>
              </div>
              {alreadyBridged && (
                <div className="alert alert-warning py-2">
                  This project has already been bridged. No further minting possible.
                </div>
              )}
            </>
          )}

          <button
            className="btn btn-success w-100"
            type="submit"
            disabled={
              loading ||
              !contract ||
              !registryEntry ||
              alreadyBridged
            }
          >
            {loading ? "Minting..." : "Mint Project NFTs"}
          </button>
        </form>
      </div>
    </div>
  );
}