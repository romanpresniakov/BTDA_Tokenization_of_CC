import React, { useEffect, useState } from "react";

// CHANGE THIS to your gateway:
const PINATA_GATEWAY = "https://yellow-wooden-pinniped-79.mypinata.cloud/ipfs/";

// Utility to convert ipfs://... to HTTP for your gateway
function ipfsToHttp(ipfsUri) {
  if (!ipfsUri) return "";
  if (ipfsUri.startsWith("ipfs://")) {
    return PINATA_GATEWAY + ipfsUri.slice(7);
  }
  return ipfsUri.startsWith("http") ? ipfsUri : PINATA_GATEWAY + ipfsUri;
}

export default function GalleryPage({ contract, walletAddress }) {
  const [projects, setProjects] = useState([]);
  const [ipfsMeta, setIpfsMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [retiring, setRetiring] = useState({});
  const [retireMsg, setRetireMsg] = useState({});
  const [retireInput, setRetireInput] = useState({});

  // Add soft gray background to the whole page (one-time)
  useEffect(() => {
    document.body.style.background = "#f4f7fa";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // 1. Fetch on-chain projects
  useEffect(() => {
    if (!contract || !walletAddress) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const projectCounter = await contract.projectCounter();
        const tokenCounter = await contract.tokenCounter();
        const projectList = [];
        for (let projectId = 0; projectId < Number(projectCounter); projectId++) {
          const [registryProjectId, ipfsCID, location, projectName] = await contract.getProjectData(projectId);

          let totalNFTs = 0;
          let userTokens = [];
          for (let tokenId = 0; tokenId < Number(tokenCounter); tokenId++) {
            const tokenProjectId = await contract.tokenToProject(tokenId);
            if (Number(tokenProjectId) === projectId) {
              totalNFTs++;
              const owner = await contract.ownerOf(tokenId);
              if (owner.toLowerCase() === walletAddress.toLowerCase()) {
                const retired = await contract.isRetired(tokenId);
                userTokens.push({ tokenId, retired });
              }
            }
          }

          projectList.push({
            projectId,
            registryProjectId,
            ipfsCID,
            location,
            projectName,
            totalNFTs,
            userTokens,
          });
        }
        setProjects(projectList);
      } catch (err) {
        console.error("Error loading projects:", err);
      }
      setLoading(false);
    };

    fetchProjects();
  }, [contract, walletAddress]);

  // 2. Fetch IPFS metadata for each project (async batch) using custom gateway
  useEffect(() => {
    async function fetchIpfsMeta() {
      const newMeta = {};
      await Promise.all(
        projects.map(async project => {
          if (!project.ipfsCID) return;
          try {
            const url = ipfsToHttp(project.ipfsCID);
            const res = await fetch(url, { cache: "reload" });
            if (res.ok) {
              const meta = await res.json();
              newMeta[project.projectId] = meta;
            }
          } catch { /* Ignore IPFS errors */ }
        })
      );
      setIpfsMeta(newMeta);
    }
    if (projects.length > 0) fetchIpfsMeta();
  }, [projects]);

  // Handler to retire N tokens
  const handleRetire = async (projectId, numToRetire) => {
    setRetireMsg({});
    setRetiring((prev) => ({ ...prev, [projectId]: true }));

    try {
      const project = projects.find(p => p.projectId === projectId);
      const activeTokens = project.userTokens.filter(t => !t.retired);
      if (numToRetire < 1 || numToRetire > activeTokens.length) {
        setRetireMsg((prev) => ({
          ...prev,
          [projectId]: `Invalid number. You have ${activeTokens.length} active tokens.`,
        }));
        setRetiring((prev) => ({ ...prev, [projectId]: false }));
        return;
      }
      for (let i = 0; i < numToRetire; i++) {
        const tokenId = activeTokens[i].tokenId;
        const tx = await contract.retire(tokenId);
        await tx.wait();
      }
      setRetireMsg((prev) => ({
        ...prev,
        [projectId]: `Retired ${numToRetire} token(s)!`,
      }));
      window.location.reload(); // Demo: reload to refresh data
    } catch (e) {
      setRetireMsg((prev) => ({
        ...prev,
        [projectId]: "Error retiring tokens: " + (e.reason || e.message),
      }));
      setRetiring((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  // User's collections
  const myProjects = projects.filter(p => p.userTokens.length > 0);

  // Helper: get metadata (fallbacks to on-chain name/location)
  const getMeta = (project) => {
    const meta = ipfsMeta[project.projectId];
    return {
      name: meta?.name || project.projectName,
      description: meta?.description,
      image: meta?.image ? ipfsToHttp(meta.image) : null,
      location: meta?.location || project.location,
    };
  };

  return (
    <div className="container">
      <h2 className="mb-4 fw-bold text-center" style={{ letterSpacing: "0.03em", fontSize: "2rem" }}>
        Bridged Carbon Projects
      </h2>
      {loading && <div>Loading projects...</div>}

      <h4 className="mt-4 fw-semibold text-secondary">My Collections</h4>
      {myProjects.length === 0 && <p>You don't own any NFTs in a bridged collection.</p>}
      <div className="row">
        {myProjects.map(project => {
          const activeTokens = project.userTokens.filter(t => !t.retired);
          const retiredTokens = project.userTokens.filter(t => t.retired);
          const meta = getMeta(project);

          return (
            <div key={project.projectId} className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm border-0 rounded-4" style={{ background: "#fff" }}>
                {meta.image && (
                  <img
                    src={meta.image}
                    alt={meta.name}
                    style={{
                      width: "100%",
                      borderRadius: "2rem 2rem 0 0",
                      maxHeight: 260,
                      objectFit: "cover",
                      borderBottom: "1px solid #f2f2f2"
                    }}
                  />
                )}
                <div className="card-body px-4 py-3">
                  <span className="badge bg-success mb-2 px-3 py-2" style={{ fontSize: 15, fontWeight: 500, borderRadius: 14 }}>Bridged from registry</span>
                  <h5 className="card-title mb-2" style={{ fontSize: 24, fontWeight: 700, letterSpacing: ".01em" }}>{meta.name}</h5>
                  <div className="mb-2 text-muted" style={{ fontSize: 15 }}><strong>Registry Project ID:</strong> {project.registryProjectId}</div>
                  <div className="mb-2" style={{ fontSize: 15 }}><strong>Location:</strong> {meta.location}</div>
                  <div className="mb-2" style={{ fontSize: 15 }}><strong>Total NFTs:</strong> {project.totalNFTs}</div>
                  <div className="mb-2" style={{ fontSize: 15 }}>
                    <strong>IPFS:</strong>{" "}
                    <a href={ipfsToHttp(project.ipfsCID)} target="_blank" rel="noopener noreferrer" className="text-primary" style={{ wordBreak: "break-all" }}>
                      {project.ipfsCID}
                    </a>
                  </div>
                  {meta.description && <div className="mb-2 text-secondary" style={{ fontSize: 16 }}>{meta.description}</div>}
                  <div className="mb-2">
                    <strong>Your Active NFTs:</strong> {activeTokens.length}
                  </div>
                  <div className="mb-2">
                    <strong>Your Retired NFTs:</strong> {retiredTokens.length}
                  </div>
                  <div className="mb-2 d-flex align-items-center">
                    <input
                      type="number"
                      min={1}
                      max={activeTokens.length}
                      value={retireInput[project.projectId] || ""}
                      onChange={e =>
                        setRetireInput(input => ({
                          ...input,
                          [project.projectId]: e.target.value,
                        }))
                      }
                      className="form-control"
                      style={{ width: 90, marginRight: 10, borderRadius: 10, fontSize: 17 }}
                      placeholder="Amount"
                      disabled={activeTokens.length === 0 || retiring[project.projectId]}
                    />
                    <button
                      className="btn btn-danger px-3 py-2"
                      style={{ fontWeight: 500, borderRadius: 12 }}
                      disabled={
                        retiring[project.projectId] ||
                        !retireInput[project.projectId] ||
                        Number(retireInput[project.projectId]) < 1 ||
                        Number(retireInput[project.projectId]) > activeTokens.length
                      }
                      onClick={() =>
                        handleRetire(
                          project.projectId,
                          Number(retireInput[project.projectId])
                        )
                      }
                    >
                      {retiring[project.projectId] ? "Retiring..." : "Retire"}
                    </button>
                  </div>
                  {retireMsg[project.projectId] && (
                    <div className="mt-2">
                      <span
                        className={
                          retireMsg[project.projectId].toLowerCase().includes("retired")
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {retireMsg[project.projectId]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Bridged Projects (display only, no retire) */}
      <h4 className="mt-5 fw-semibold text-secondary">All Bridged Projects</h4>
      <div className="row">
        {projects.length === 0 && !loading && <p>No bridged projects found.</p>}
        {projects.map(project => {
          const meta = getMeta(project);
          return (
            <div key={project.projectId} className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm border-0 rounded-4" style={{ background: "#fff" }}>
                {meta.image && (
                  <img
                    src={meta.image}
                    alt={meta.name}
                    style={{
                      width: "100%",
                      borderRadius: "2rem 2rem 0 0",
                      maxHeight: 260,
                      objectFit: "cover",
                      borderBottom: "1px solid #f2f2f2"
                    }}
                  />
                )}
                <div className="card-body px-4 py-3">
                  <span className="badge bg-success mb-2 px-3 py-2" style={{ fontSize: 15, fontWeight: 500, borderRadius: 14 }}>Bridged from registry</span>
                  <h5 className="card-title mb-2" style={{ fontSize: 24, fontWeight: 700, letterSpacing: ".01em" }}>{meta.name}</h5>
                  <div className="mb-2 text-muted" style={{ fontSize: 15 }}><strong>Registry Project ID:</strong> {project.registryProjectId}</div>
                  <div className="mb-2" style={{ fontSize: 15 }}><strong>Location:</strong> {meta.location}</div>
                  <div className="mb-2" style={{ fontSize: 15 }}><strong>Total NFTs:</strong> {project.totalNFTs}</div>
                  <div className="mb-2" style={{ fontSize: 15 }}>
                    <strong>IPFS:</strong>{" "}
                    <a href={ipfsToHttp(project.ipfsCID)} target="_blank" rel="noopener noreferrer" className="text-primary" style={{ wordBreak: "break-all" }}>
                      {project.ipfsCID}
                    </a>
                  </div>
                  {meta.description && <div className="mb-2 text-secondary" style={{ fontSize: 16 }}>{meta.description}</div>}
                  {/* No retire UI for all projects */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}