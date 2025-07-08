import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarbonNFTAddress from "./contracts/CarbonNFT-address.json";
import CarbonNFTAbi from "./contracts/CarbonNFT-abi.json";

export default function AppWrapper() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);

  const [projects, setProjects] = useState([]); // [{ projectId, ipfsCID, location, projectName }]
  const [tokens, setTokens] = useState([]); // [{ id, owner, projectId, retired }]
  const [metadata, setMetadata] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // -------- Wallet connection and contract initialization -----------
  useEffect(() => {
    checkWalletConnection();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
      await initializeContract(accounts[0]);
    } else {
      setWalletAddress("");
      setWalletConnected(false);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await initializeContract(accounts[0]);
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
        setError("Error checking wallet connection");
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setLoading(true);
        setError("");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await initializeContract(accounts[0]);
        }
      } catch (err) {
        console.error("Error connecting wallet:", err);
        setError("Failed to connect wallet: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please install MetaMask or another Web3 wallet to use this application");
    }
  };

  // --------- Contract Setup and Data Fetching ------------

  const initializeContract = async (addressOverride = null) => {
    try {
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      const tempSigner = await tempProvider.getSigner();
      const address = addressOverride || (await tempSigner.getAddress());
      const tempContract = new ethers.Contract(CarbonNFTAddress.address, CarbonNFTAbi, tempSigner);

      setProvider(tempProvider);
      setSigner(tempSigner);
      setContract(tempContract);
      setWalletAddress(address);
      setWalletConnected(true);

      await Promise.all([loadProjects(tempContract), loadTokens(tempContract)]);
    } catch (err) {
      console.error("Error initializing contract:", err);
      setError("Error initializing contract: " + err.message);
    }
  };

  // ------------- Projects & Tokens ---------------

  // Load all projects and their metadata
  const loadProjects = async (contractInstance = contract) => {
    try {
      const projectCount = await contractInstance.projectCounter();
      const list = [];
      for (let i = 0; i < projectCount; i++) {
        const [ipfsCID, location, projectName] = await contractInstance.getProjectData(i);
        list.push({ projectId: i, ipfsCID, location, projectName });
      }
      setProjects(list);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Error loading projects: " + err.message);
    }
  };

  // Load all tokens and assign project IDs
  const loadTokens = async (contractInstance = contract) => {
    try {
      const tokenCount = await contractInstance.tokenCounter();
      const list = [];
      for (let i = 0; i < tokenCount; i++) {
        const owner = await contractInstance.ownerOf(i);
        const retired = await contractInstance.isRetired(i);
        const projectId = await contractInstance.tokenToProject(i);
        list.push({ id: i, owner, retired, projectId: projectId.toNumber ? projectId.toNumber() : Number(projectId) });
      }
      setTokens(list);
    } catch (err) {
      console.error("Error loading tokens:", err);
      setError("Error loading tokens: " + err.message);
    }
  };

  // Fetch project metadata for viewing details
  const fetchProjectMetadata = async (projectId) => {
    try {
      if (!contract) return null;
      const [ipfsCID, location, projectName] = await contract.getProjectData(projectId);
      return { projectId, ipfsCID, location, projectName };
    } catch (err) {
      console.error("Error loading project metadata:", err);
      setError("Error loading project metadata: " + err.message);
      return null;
    }
  };

  // MintPage handles minting by calling contract directly, but you can also add here if you want

  // GalleryPage uses this to view metadata for a project
  const loadMetadata = async (projectId) => {
    const data = await fetchProjectMetadata(projectId);
    setMetadata(data);
  };

  return {
    contract,
    signer,
    walletAddress,
    walletConnected,
    connectWallet,
    projects,
    tokens,
    metadata,
    loadProjects,
    loadTokens,
    loadMetadata,
    loading,
    setLoading,
    error,
    setError,
  };
}
