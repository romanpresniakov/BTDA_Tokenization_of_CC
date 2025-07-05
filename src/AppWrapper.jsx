import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarbonNFTAddress from "./contracts/CarbonNFT-address.json";
import CarbonNFTAbi from "./contracts/CarbonNFT-abi.json";

export default function AppWrapper() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [mintData, setMintData] = useState({ ipfsCID: "", location: "", projectName: "" });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Effect: On startup, try to connect and set up everything
  useEffect(() => {
    checkWalletConnection();

    // Listen for account changes (MetaMask etc.)
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

  // When account changes, update address and reconnect
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

  // Pass the correct address!
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

      await loadTokens(tempContract);
    } catch (err) {
      console.error("Error initializing contract:", err);
      setError("Error initializing contract: " + err.message);
    }
  };

  const loadTokens = async (contractInstance = contract) => {
    try {
      const total = await contractInstance.tokenCounter();
      const list = [];
      for (let i = 0; i < total; i++) {
        const owner = await contractInstance.ownerOf(i);
        const retired = await contractInstance.isRetired(i);
        list.push({ id: i, owner, retired });
      }
      setTokens(list);
    } catch (err) {
      console.error("Error loading tokens:", err);
      setError("Error loading tokens: " + err.message);
    }
  };

  const mintNFT = async () => {
    console.log("mintNFT called", contract, signer, mintData);
    if (!contract || !signer) return;
    if (!mintData.ipfsCID || !mintData.location || !mintData.projectName) {
      setError("Please fill in all fields before minting.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const tx = await contract.mintNFT(
        walletAddress,
        mintData.ipfsCID,
        mintData.location,
        mintData.projectName
      );
      await tx.wait();
      setError("✅ NFT successfully minted.");
      await loadTokens();
      setMintData({ ipfsCID: "", location: "", projectName: "" });
    } catch (err) {
      console.error("Error minting NFT:", err);
      setError("Error minting NFT: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const retireToken = async (id) => {
    if (!contract) return;
    try {
      setLoading(true);
      setError("");
      const tx = await contract.retire(id);
      await tx.wait();
      await loadTokens();
    } catch (err) {
      console.error("Error retiring token:", err);
      setError("Error retiring token: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenUriMetadata = async (id) => {
    try {
      const uri = await contract.tokenURI(id);
      const url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch tokenURI metadata", err);
      return null;
    }
  };

  const loadMetadata = async (id) => {
    if (!contract) return;
    try {
      const data = await contract.getProjectData(id);
      const offchain = await fetchTokenUriMetadata(id);
      setMetadata({
        id,
        ipfsCID: data[0],
        location: data[1],
        projectName: data[2],
        offchain,
      });
    } catch (err) {
      console.error("Error loading metadata:", err);
      setError("Error loading metadata: " + err.message);
    }
  };

  return {
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
    walletAddress, // ← Always returned and always up to date!
    walletConnected,
    connectWallet,
  };
}
