const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonNFT", function () {
    let carbonNFT;
    let owner;
    let addr1;
    let addr2;

    // Mock project data
    const projects = [
        {
            ipfsCID: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
            location: "Amazon Rainforest, Brazil",
            projectName: "Amazon Reforestation Project Alpha"
        },
        {
            ipfsCID: "QmPChd2hVbrJ5bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF6pN",
            location: "Kenya, East Africa",
            projectName: "Solar Energy Carbon Offset Initiative"
        },
        {
            ipfsCID: "QmSKboVigcD3AY4kLsob117KJcMHvMUu6vNFqk1PQzYUpp",
            location: "California, USA",
            projectName: "Coastal Wetland Restoration Program"
        }
    ];

    beforeEach(async function () {
        // Get the ContractFactory and Signers
        const CarbonNFT = await ethers.getContractFactory("CarbonNFT");
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy the contract
        carbonNFT = await CarbonNFT.deploy();
        await carbonNFT.waitForDeployment();
    });

    describe("Initial State", function () {
        it("Should set the right owner", async function () {
            expect(await carbonNFT.owner()).to.equal(owner.address);
        });

        it("Should start with token counter at 0", async function () {
            expect(await carbonNFT.tokenCounter()).to.equal(0);
        });

        it("Should have correct name and symbol", async function () {
            expect(await carbonNFT.name()).to.equal("CarbonNFT");
            expect(await carbonNFT.symbol()).to.equal("CNFT");
        });
    });

    describe("Minting", function () {
        it("Should mint NFTs with correct project data", async function () {
            // Mint first token
            const tx1 = await carbonNFT.mintNFT(
                addr1.address,
                projects[0].ipfsCID,
                projects[0].location,
                projects[0].projectName
            );
            await tx1.wait();

            // Mint second token
            const tx2 = await carbonNFT.mintNFT(
                addr2.address,
                projects[1].ipfsCID,
                projects[1].location,
                projects[1].projectName
            );
            await tx2.wait();

            // Mint third token
            const tx3 = await carbonNFT.mintNFT(
                addr1.address,
                projects[2].ipfsCID,
                projects[2].location,
                projects[2].projectName
            );
            await tx3.wait();

            // Check token counter
            expect(await carbonNFT.tokenCounter()).to.equal(3);

            // Verify ownership
            expect(await carbonNFT.ownerOf(0)).to.equal(addr1.address);
            expect(await carbonNFT.ownerOf(1)).to.equal(addr2.address);
            expect(await carbonNFT.ownerOf(2)).to.equal(addr1.address);

            // Check balances
            expect(await carbonNFT.balanceOf(addr1.address)).to.equal(2);
            expect(await carbonNFT.balanceOf(addr2.address)).to.equal(1);
        });

        it("Should only allow owner to mint", async function () {
            await expect(
                carbonNFT.connect(addr1).mintNFT(
                    addr1.address,
                    projects[0].ipfsCID,
                    projects[0].location,
                    projects[0].projectName
                )
            ).to.be.revertedWithCustomError(carbonNFT, "OwnableUnauthorizedAccount");
        });
    });

    describe("Project Data Retrieval", function () {
        beforeEach(async function () {
            // Mint test tokens
            for (let i = 0; i < 3; i++) {
                const tx = await carbonNFT.mintNFT(
                    i % 2 === 0 ? addr1.address : addr2.address,
                    projects[i].ipfsCID,
                    projects[i].location,
                    projects[i].projectName
                );
                await tx.wait();
            }
        });

        it("Should return correct project data for each token", async function () {
            // Check project data for each token
            for (let i = 0; i < 3; i++) {
                const [ipfsCID, location, projectName] = await carbonNFT.getProjectData(i);
                
                expect(ipfsCID).to.equal(projects[i].ipfsCID);
                expect(location).to.equal(projects[i].location);
                expect(projectName).to.equal(projects[i].projectName);
            }
        });

        it("Should return correct tokenURI", async function () {
            for (let i = 0; i < 3; i++) {
                const tokenURI = await carbonNFT.tokenURI(i);
                const expectedURI = `ipfs://${projects[i].ipfsCID}`;
                
                expect(tokenURI).to.equal(expectedURI);
            }
        });

        it("Should revert when querying non-existent token", async function () {
            await expect(carbonNFT.getProjectData(999))
                .to.be.revertedWith("Token does not exist");
            
            await expect(carbonNFT.tokenURI(999))
                .to.be.revertedWith("Token does not exist");
        });
    });

    describe("Token Retirement", function () {
        beforeEach(async function () {
            // Mint test tokens
            for (let i = 0; i < 3; i++) {
                const tx = await carbonNFT.mintNFT(
                    i % 2 === 0 ? addr1.address : addr2.address,
                    projects[i].ipfsCID,
                    projects[i].location,
                    projects[i].projectName
                );
                await tx.wait();
            }
        });

        it("Should allow token owner to retire their token", async function () {
            // Retire token 0 (owned by addr1)
            const tx = await carbonNFT.connect(addr1).retire(0);
            const receipt = await tx.wait();

            // Check that the Retired event was emitted
            const retiredEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'Retired'
            );
            
            expect(retiredEvent).to.not.be.undefined;
            expect(retiredEvent.args.tokenId).to.equal(0);
            expect(retiredEvent.args.owner).to.equal(addr1.address);

            // Check retirement status
            expect(await carbonNFT.isRetired(0)).to.be.true;
        });

        it("Should not allow non-owner to retire token", async function () {
            // Try to retire token 0 (owned by addr1) from addr2
            await expect(carbonNFT.connect(addr2).retire(0))
                .to.be.revertedWith("Only owner can retire");
        });

        it("Should not allow retiring already retired token", async function () {
            // Retire token 0
            await carbonNFT.connect(addr1).retire(0);

            // Try to retire again
            await expect(carbonNFT.connect(addr1).retire(0))
                .to.be.revertedWith("Token already retired");
        });

        it("Should prevent transfer of retired tokens", async function () {
            // Retire token 0
            await carbonNFT.connect(addr1).retire(0);

            // Try to transfer retired token
            await expect(
                carbonNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 0)
            ).to.be.revertedWith("Token is retired and cannot be transferred");
        });

        it("Should allow transfer of non-retired tokens", async function () {
            // Transfer non-retired token 2 from addr1 to addr2
            await carbonNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 2);

            // Verify transfer
            expect(await carbonNFT.ownerOf(2)).to.equal(addr2.address);
            expect(await carbonNFT.balanceOf(addr1.address)).to.equal(1);
            expect(await carbonNFT.balanceOf(addr2.address)).to.equal(2);
        });
    });

    describe("Complete Integration Test", function () {
        it("Should handle complete workflow: mint, query, retire, verify", async function () {
            console.log("\n=== CarbonNFT Integration Test ===");

            // Step 1: Mint tokens
            console.log("Step 1: Minting tokens...");
            for (let i = 0; i < 3; i++) {
                const recipient = i % 2 === 0 ? addr1.address : addr2.address;
                const tx = await carbonNFT.mintNFT(
                    recipient,
                    projects[i].ipfsCID,
                    projects[i].location,
                    projects[i].projectName
                );
                await tx.wait();
                console.log(`  Token ${i} minted to ${recipient}`);
            }

            // Step 2: Query project information
            console.log("\nStep 2: Querying project information...");
            for (let i = 0; i < 3; i++) {
                const [ipfsCID, location, projectName] = await carbonNFT.getProjectData(i);
                console.log(`  Token ${i}:`);
                console.log(`    Project: ${projectName}`);
                console.log(`    Location: ${location}`);
                console.log(`    IPFS CID: ${ipfsCID}`);
                console.log(`    Token URI: ${await carbonNFT.tokenURI(i)}`);
                console.log(`    Owner: ${await carbonNFT.ownerOf(i)}`);
                console.log(`    Retired: ${await carbonNFT.isRetired(i)}`);
            }

            // Step 3: Retire token 1
            console.log("\nStep 3: Retiring token 1...");
            const retireTx = await carbonNFT.connect(addr2).retire(1);
            await retireTx.wait();
            console.log("  Token 1 successfully retired");

            // Step 4: Verify retirement status
            console.log("\nStep 4: Verifying retirement status...");
            for (let i = 0; i < 3; i++) {
                const isRetired = await carbonNFT.isRetired(i);
                console.log(`  Token ${i} retired: ${isRetired}`);
            }

            // Step 5: Test transfer restrictions
            console.log("\nStep 5: Testing transfer restrictions...");
            
            // Should fail - retired token
            try {
                await carbonNFT.connect(addr2).transferFrom(addr2.address, addr1.address, 1);
                console.log("  ERROR: Retired token transfer should have failed!");
            } catch (error) {
                console.log("  ✓ Retired token transfer correctly blocked");
            }

            // Should succeed - non-retired token
            try {
                await carbonNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 2);
                console.log("  ✓ Non-retired token transfer successful");
            } catch (error) {
                console.log("  ERROR: Non-retired token transfer failed:", error.message);
            }

            // Final verification
            console.log("\nFinal State:");
            console.log(`  Total tokens: ${await carbonNFT.tokenCounter()}`);
            console.log(`  addr1 balance: ${await carbonNFT.balanceOf(addr1.address)}`);
            console.log(`  addr2 balance: ${await carbonNFT.balanceOf(addr2.address)}`);
            
            // Assertions for the test
            expect(await carbonNFT.tokenCounter()).to.equal(3);
            expect(await carbonNFT.isRetired(0)).to.be.false;
            expect(await carbonNFT.isRetired(1)).to.be.true;
            expect(await carbonNFT.isRetired(2)).to.be.false;
            expect(await carbonNFT.ownerOf(2)).to.equal(addr2.address); // Transferred
        });
    });
});