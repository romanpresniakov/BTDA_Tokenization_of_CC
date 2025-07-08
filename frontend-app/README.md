---

Carbon NFT Bridge

Bridging Real-World Carbon Credit Projects to On-Chain NFTs


---

Overview

Carbon NFT Bridge is a demo dApp that allows users to bridge carbon credit retirement projects from an off-chain registry into on-chain NFT collections. Each NFT represents 1 ton of CO₂ offset, and entire projects (collections) can be minted, tracked, and retired on the blockchain.


---

Features

Bridging: Import ("bridge") a carbon retirement project from a registry and batch-mint NFTs for each ton retired.

IPFS Integration: All project metadata (including images and descriptions) is stored on IPFS.

Collection Tracking: Each project is a collection, and you can see both your own and all bridged projects.

Retirement: Owners can retire any number of NFTs in their collection, making the offset permanent.

Mock Registry: The demo includes a mock registry file for testing without real-world carbon credits.



---

Tech Stack

Smart Contract: Solidity, OpenZeppelin (ERC721, Enumerable)

Frontend: React, Bootstrap, ethers.js

IPFS: Pinata Cloud (or other gateway)

Local Blockchain: Hardhat



---

Getting Started

1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

2. Install Dependencies

Backend:

cd backend
npm install

Frontend:

cd frontend-app
npm install

3. Start Local Blockchain

npx hardhat node

4. Deploy the Smart Contract

In a new terminal:

npx hardhat run scripts/deploy.js --network localhost

5. Start the Frontend

cd frontend-app
npm start
# or
npm run dev

6. Connect MetaMask

Add localhost:8545 as a network in MetaMask.

Import a private key from Hardhat's test accounts (you get test ETH automatically).



---

How To Use

1. Bridge a Project

On the Mint page, enter a Project ID from the mock registry.

The dApp auto-fills details from the registry.

Click “Mint Project NFTs” to bridge and mint the collection.



2. View Your Collections

Switch to the Gallery page to see all bridged projects and your own NFT holdings.

View on-chain and IPFS metadata.



3. Retire NFTs

For collections you own, retire (burn) any number of NFTs to represent the permanent offset.





---

IPFS Integration

Metadata and images are stored on IPFS (Pinata or public gateway).

The dApp fetches and displays this data in the Gallery.



---

Mock Registry

The demo uses mockRegistry.json as an example carbon retirement registry.

Add or edit entries to test different scenarios.



---

Known Issues / Limitations

For demonstration only: not audited or suitable for production.

Uses a mock registry, not connected to real-world Verra or Gold Standard APIs.

Designed for local or testnet usage.



---

Screenshots

> (Add demo screenshots or gifs here for extra clarity)




---

Credits

Project by [Your Name]

Smart Contract: OpenZeppelin

Frontend: React, Bootstrap

IPFS: Pinata



---

License

MIT License


---