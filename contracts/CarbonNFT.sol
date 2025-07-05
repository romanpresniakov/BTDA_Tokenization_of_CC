// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonNFT is ERC721Enumerable, Ownable {
    uint256 public tokenCounter;

    struct ProjectData {
        string ipfsCID;
        string location;
        string projectName;
        string projectDescription;
    }

    mapping(uint256 => ProjectData) private tokenMetadata;
    mapping(uint256 => bool) private _retired;

    event Retired(uint256 indexed tokenId, address indexed owner);

    constructor() ERC721("CarbonNFT", "CNFT") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    function mintNFT(
        address recipient,
        string memory ipfsCID,
        string memory location,
        string memory projectName
    ) public onlyOwner returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);

        tokenMetadata[newTokenId] = ProjectData({
            ipfsCID: ipfsCID,
            location: location,
            projectName: projectName
        });

        tokenCounter++;
        return newTokenId;
    }

    function getProjectData(uint256 tokenId) public view returns (string memory, string memory, string memory) {
        require( _ownerOf(tokenId) != address(0), "Token does not exist");
        ProjectData memory data = tokenMetadata[tokenId];
        return (data.ipfsCID, data.location, data.projectName);
    }

    //return IPFS URI directly
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require( _ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked("ipfs://", tokenMetadata[tokenId].ipfsCID));
    }

    function retire(uint256 tokenId) public {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can retire");
        require(!_retired[tokenId], "Token already retired");

        _retired[tokenId] = true;

        //emit an event
        emit Retired(tokenId, msg.sender);
    }

    //is carried out before transfer each time
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Enumerable)
        returns (address) {
        require(!_retired[tokenId], "Token is retired and cannot be transferred");
        return super._update(to, tokenId, auth);
    }

    function isRetired(uint256 tokenId) public view returns (bool) {
        return _retired[tokenId];
    }
}
