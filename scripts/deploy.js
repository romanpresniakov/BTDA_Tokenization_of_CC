const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const CarbonNFT = await hre.ethers.getContractFactory("CarbonNFT");
  const carbonNFT = await CarbonNFT.deploy();
  //await carbonNFT.deployed();

  console.log("✅ CarbonNFT deployed to:", carbonNFT.target);

  // Save address
  const contractsDir = "./frontend-app/src/contracts";
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    `${contractsDir}/CarbonNFT-address.json`,
    JSON.stringify({ address: carbonNFT.target }, null, 2)
  );

  // Save ABI
  const artifact = await hre.artifacts.readArtifact("CarbonNFT");
  fs.writeFileSync(
    `${contractsDir}/CarbonNFT-abi.json`,
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("📦 Contract ABI and address saved to frontend.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
