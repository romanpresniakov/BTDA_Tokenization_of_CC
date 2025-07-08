// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonNFT is ERC721Enumerable, Ownable {
    uint256 public tokenCounter;
    uint256 public projectCounter;

    struct ProjectData {
        string registryProjectId; // E.g. VCS-100001 or your demo registry string
        string ipfsCID;
        string location;
        string projectName;
    }

    // projectId => ProjectData
    mapping(uint256 => ProjectData) public projects;
    // tokenId => projectId
    mapping(uint256 => uint256) public tokenToProject;
    // tokenId => retired flag
    mapping(uint256 => bool) private _retired;
    // registryProjectId => true if already bridged (enforces 1:1 bridging)
    mapping(string => bool) public bridgedProjectIds;

    event Retired(uint256 indexed tokenId, address indexed owner);
    event ProjectCreated(uint256 indexed projectId, address indexed creator, string registryProjectId);
    event BatchMinted(uint256 indexed projectId, address indexed recipient, uint256 amount);

    constructor() ERC721("CarbonNFT", "CNFT") Ownable(msg.sender) {
        tokenCounter = 0;
        projectCounter = 0;
    }

    // Bridge a registry project: store metadata and mark as bridged
    function createProject(
        string memory registryProjectId,
        string memory ipfsCID,
        string memory location,
        string memory projectName
    ) public returns (uint256) { // <--- removed onlyOwner
        require(!bridgedProjectIds[registryProjectId], "Project already bridged");
        uint256 newProjectId = projectCounter;
        projects[newProjectId] = ProjectData(registryProjectId, ipfsCID, location, projectName);
        projectCounter++;
        bridgedProjectIds[registryProjectId] = true;
        emit ProjectCreated(newProjectId, msg.sender, registryProjectId);
        return newProjectId;
    }

    // Mint a single NFT (1 ton CO₂) for a bridged project
    function mintNFT(address recipient, uint256 projectId) public returns (uint256) { // <--- removed onlyOwner
        require(projectId < projectCounter, "Project does not exist");
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);
        tokenToProject[newTokenId] = projectId;
        tokenCounter++;
        return newTokenId;
    }

    // Batch mint NFTs (amount = tons of CO₂) for a project
    function mintBatch(address recipient, uint256 projectId, uint256 amount) public { // <--- removed onlyOwner
        require(projectId < projectCounter, "Project does not exist");
        require(amount > 0, "Amount must be > 0");
        for (uint256 i = 0; i < amount; i++) {
            mintNFT(recipient, projectId);
        }
        emit BatchMinted(projectId, recipient, amount);
    }

    // Return all project metadata by tokenId
    function getProjectDataByToken(uint256 tokenId)
        public
        view
        returns (
            string memory registryProjectId,
            string memory ipfsCID,
            string memory location,
            string memory projectName
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 projectId = tokenToProject[tokenId];
        ProjectData memory data = projects[projectId];
        return (data.registryProjectId, data.ipfsCID, data.location, data.projectName);
    }

    // Return all project metadata by projectId
    function getProjectData(uint256 projectId)
        public
        view
        returns (
            string memory registryProjectId,
            string memory ipfsCID,
            string memory location,
            string memory projectName
        )
    {
        require(projectId < projectCounter, "Project does not exist");
        ProjectData memory data = projects[projectId];
        return (data.registryProjectId, data.ipfsCID, data.location, data.projectName);
    }

    // Return IPFS URI based on project metadata
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 projectId = tokenToProject[tokenId];
        return string(abi.encodePacked("ipfs://", projects[projectId].ipfsCID));
    }

    // Allow NFT owner to retire (burn/retire) the NFT
    function retire(uint256 tokenId) public {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can retire");
        require(!_retired[tokenId], "Token already retired");
        _retired[tokenId] = true;
        emit Retired(tokenId, msg.sender);
    }

    // Restrict transfer of retired tokens
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Enumerable)
        returns (address)
    {
        require(!_retired[tokenId], "Token is retired and cannot be transferred");
        return super._update(to, tokenId, auth);
    }

    // Query if token is retired
    function isRetired(uint256 tokenId) public view returns (bool) {
        return _retired[tokenId];
    }

    // Get registry project ID by projectId (helper)
    function getRegistryProjectId(uint256 projectId) public view returns (string memory) {
        require(projectId < projectCounter, "Project does not exist");
        return projects[projectId].registryProjectId;
    }
}