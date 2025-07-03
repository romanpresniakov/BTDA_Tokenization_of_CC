import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CarbonNFTAddress from './contracts/CarbonNFT-address.json';
import CarbonNFTAbi from './contracts/CarbonNFT-abi.json';

export default function CarbonNFTApp() {
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

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await initializeContract();
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
        setError('Error checking wallet connection');
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        setError("");
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await initializeContract();
        
      } catch (err) {
        console.error('Error connecting wallet:', err);
        setError('Failed to connect wallet: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please install MetaMask or another Web3 wallet to use this application');
    }
  };

  const initializeContract = async () => {
    try {
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      const tempSigner = await tempProvider.getSigner();
      const address = await tempSigner.getAddress();
      const tempContract = new ethers.Contract(CarbonNFTAddress.address, CarbonNFTAbi, tempSigner);
      
      setProvider(tempProvider);
      setSigner(tempSigner);
      setContract(tempContract);
      setWalletAddress(address);
      setWalletConnected(true);

      // Load existing tokens
      await loadTokens(tempContract);
      
    } catch (err) {
      console.error('Error initializing contract:', err);
      setError('Error initializing contract: ' + err.message);
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
      console.error('Error loading tokens:', err);
      setError('Error loading tokens: ' + err.message);
    }
  };

  const mintNFT = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      setError("");
      
      const tx = await contract.mintNFT(
        await signer.getAddress(), 
        mintData.ipfsCID, 
        mintData.location, 
        mintData.projectName
      );
      
      await tx.wait();
      
      // Reload tokens instead of full page reload
      await loadTokens();
      
      // Clear form
      setMintData({ ipfsCID: "", location: "", projectName: "" });
      
    } catch (err) {
      console.error('Error minting NFT:', err);
      setError('Error minting NFT: ' + err.message);
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
      
      // Reload tokens instead of full page reload
      await loadTokens();
      
    } catch (err) {
      console.error('Error retiring token:', err);
      setError('Error retiring token: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async (id) => {
    if (!contract) return;
    
    try {
      const data = await contract.getProjectData(id);
      setMetadata({ id, ipfsCID: data[0], location: data[1], projectName: data[2] });
    } catch (err) {
      console.error('Error loading metadata:', err);
      setError('Error loading metadata: ' + err.message);
    }
  };

  // If wallet is not available
  if (typeof window.ethereum === 'undefined') {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Web3 Wallet Required</h2>
            <p className="text-gray-600 mb-4">
              To use this Carbon NFT application, you need to install a Web3 wallet like MetaMask.
            </p>
            <Button 
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="mr-2"
            >
              Install MetaMask
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If wallet is available but not connected
  if (!walletConnected) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to interact with Carbon NFTs.
            </p>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <Button 
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Wallet Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Connected Wallet</h3>
              <p className="text-sm text-gray-600">{walletAddress}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mint NFT */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-bold">Mint Carbon NFT</h2>
          <input 
            className="w-full p-2 border rounded" 
            placeholder="IPFS CID" 
            value={mintData.ipfsCID} 
            onChange={e => setMintData({ ...mintData, ipfsCID: e.target.value })}
            disabled={loading}
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Location" 
            value={mintData.location} 
            onChange={e => setMintData({ ...mintData, location: e.target.value })}
            disabled={loading}
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Project Name" 
            value={mintData.projectName} 
            onChange={e => setMintData({ ...mintData, projectName: e.target.value })}
            disabled={loading}
          />
          <Button 
            onClick={mintNFT}
            disabled={loading || !mintData.ipfsCID || !mintData.location || !mintData.projectName}
          >
            {loading ? 'Minting...' : 'Mint'}
          </Button>
        </CardContent>
      </Card>

      {/* All Carbon NFTs */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">All Carbon NFTs</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map(token => (
                <TableRow key={token.id}>
                  <TableCell>{token.id}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {token.owner.slice(0, 6)}...{token.owner.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      token.retired 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {token.retired ? "Retired" : "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      onClick={() => loadMetadata(token.id)}
                      size="sm"
                      variant="outline"
                    >
                      View
                    </Button>
                    {!token.retired && (
                      <Button 
                        onClick={() => retireToken(token.id)}
                        size="sm"
                        variant="destructive"
                        disabled={loading}
                      >
                        {loading ? 'Retiring...' : 'Retire'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Metadata Display */}
      {metadata && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-bold">Token #{metadata.id} Metadata</h2>
            <div className="space-y-2 mt-4">
              <p><strong>Project Name:</strong> {metadata.projectName}</p>
              <p><strong>Location:</strong> {metadata.location}</p>
              <p><strong>IPFS:</strong> <a href={`https://ipfs.io/ipfs/${metadata.ipfsCID}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{metadata.ipfsCID}</a></p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}