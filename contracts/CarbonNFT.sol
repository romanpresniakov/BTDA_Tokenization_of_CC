// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonNFT is ERC721Enumerable, Ownable {
    uint256 public tokenCounter;
    uint256 public projectCounter;

    struct ProjectData {
        string registryProjectId;   // <-- NEW FIELD
        string ipfsCID;
        string location;
        string projectName;
    }

    mapping(uint256 => ProjectData) public projects; // projectId => ProjectData
    mapping(uint256 => uint256) public tokenToProject; // tokenId => projectId
    mapping(uint256 => bool) private _retired;
    mapping(string => bool) public bridgedProjectIds; // registryProjectId => true if bridged

    event Retired(uint256 indexed tokenId, address indexed owner);
    event ProjectCreated(uint256 indexed projectId, address indexed creator, string registryProjectId); // <-- Add ID to event

    constructor() ERC721("CarbonNFT", "CNFT") Ownable(msg.sender) {
        tokenCounter = 0;
        projectCounter = 0;
    }

    // Create a new project, using registryProjectId as a unique identifier
    function createProject(
        string memory registryProjectId,
        string memory ipfsCID,
        string memory location,
        string memory projectName
    ) public onlyOwner returns (uint256) {
        require(!bridgedProjectIds[registryProjectId], "Project already bridged");

        uint256 newProjectId = projectCounter;
        projects[newProjectId] = ProjectData(registryProjectId, ipfsCID, location, projectName);
        projectCounter++;
        bridgedProjectIds[registryProjectId] = true;

        emit ProjectCreated(newProjectId, msg.sender, registryProjectId);
        return newProjectId;
    }

    // Mint a single NFT for a specific project
    function mintNFT(address recipient, uint256 projectId) public onlyOwner returns (uint256) {
        require(projectId < projectCounter, "Project does not exist");
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);
        tokenToProject[newTokenId] = projectId;
        tokenCounter++;
        return newTokenId;
    }

    // Batch mint NFTs for a project (e.g., 10 NFTs = 10 tons CO2)
    function mintBatch(address recipient, uint256 projectId, uint256 amount) public onlyOwner {
        require(projectId < projectCounter, "Project does not exist");
        for (uint256 i = 0; i < amount; i++) {
            mintNFT(recipient, projectId);
        }
    }

    // Get project data by tokenId
    function getProjectDataByToken(uint256 tokenId) public view returns (string memory, string memory, string memory, string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 projectId = tokenToProject[tokenId];
        ProjectData memory data = projects[projectId];
        return (data.registryProjectId, data.ipfsCID, data.location, data.projectName);
    }

    // Get project data by projectId
    function getProjectData(uint256 projectId) public view returns (string memory, string memory, string memory, string memory) {
        require(projectId < projectCounter, "Project does not exist");
        ProjectData memory data = projects[projectId];
        return (data.registryProjectId, data.ipfsCID, data.location, data.projectName);
    }

    // Return IPFS URI based on project data
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 projectId = tokenToProject[tokenId];
        return string(abi.encodePacked("ipfs://", projects[projectId].ipfsCID));
    }

    // Retire logic unchanged
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

    function isRetired(uint256 tokenId) public view returns (bool) {
        return _retired[tokenId];
    }

    // Helper: get a project's registry ID by projectId
    function getRegistryProjectId(uint256 projectId) public view returns (string memory) {
        require(projectId < projectCounter, "Project does not exist");
        return projects[projectId].registryProjectId;
    }
}
