// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract SoftwareRegistry {

    struct Commit {
        address owner;
        string sha1Hash;
        string authorName;
        string authorEmail;
        string isoDatetime;
        // uint256 createdAt;
    }

    Commit[] _commits;
    mapping(address => uint256[]) ownerCommitMap;
    mapping(string => uint256) hashCommitMap;

    event NewRegistration(address indexed _owner, string _hash, uint256 _timestamp);

    function registerCommit(
        string memory sha1Hash,
        string memory authorName,
        string memory authorEmail,
        string memory isoDatetime
    ) public {
        require(bytes(sha1Hash).length > 0, "SHA1 hash cannot be empty");
        require(bytes(isoDatetime).length > 0, "ISO datetime cannot be empty");

        uint256 timestamp = block.timestamp;
        uint256 commitIndex = _commits.length;

        Commit memory newCommit = Commit({
            owner: msg.sender,
            sha1Hash: sha1Hash,
            authorName: authorName,
            authorEmail: authorEmail,
            isoDatetime: isoDatetime//,
            // createdAt: timestamp
        });

        _commits.push(newCommit);
        ownerCommitMap[msg.sender].push(commitIndex);
        hashCommitMap[sha1Hash] = commitIndex;

        emit NewRegistration(msg.sender, sha1Hash, timestamp);
    }

    function getCommitsByOwner(address ownerAddress) public view returns (Commit[] memory) {
        uint256[] memory commitIndices = ownerCommitMap[ownerAddress];
        Commit[] memory commits = new Commit[](commitIndices.length);

        for (uint256 i = 0; i < commitIndices.length; i++) {
            uint256 commitIndex = commitIndices[i];
            commits[i] = _commits[commitIndex];
        }

        return commits;
    }
}
