// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSStorage {

    string public ipfsCID;

    mapping (uint256 => string) public ipfsCIDs;

    function storeCID(uint256 id, string calldata cid) public {
        ipfsCIDs[id] = cid;
    }

    function getCID(uint256 id) public view returns (string memory) {
        return ipfsCIDs[id];
    }

    function setCID(string calldata cid) public {
        ipfsCID = cid;
    }

    function getCID() public view returns (string memory) {
        return ipfsCID;
    }
}
