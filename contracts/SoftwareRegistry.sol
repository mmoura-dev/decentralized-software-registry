// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract SoftwareRegistry {

    enum HashAlgorithm {
        Sha1,
        Sha256
    }

    struct Record {
        address owner;
        string combinatedFilesHash;
        HashAlgorithm hashAlgorithm;
        string ipfsUrl;
        string authorName;
        string authorEmail;
        uint256 blockTimestamp;
    }

    Record[] _records;
    mapping(address => uint256[]) ownerRecordsMap;
    mapping(string => uint256) hashRecordMap;

    event NewRegistration(address indexed _owner, string _hash, uint256 _timestamp);

    function createRecord(
        string memory combinatedFilesHash,
        HashAlgorithm hashAlgorithm,
        string memory ipfsUrl,
        string memory authorName,
        string memory authorEmail
    ) public {
        require(bytes(combinatedFilesHash).length > 0, "Hash cannot be empty");

        uint256 timestamp = block.timestamp;
        uint256 recordsSize = _records.length;

        Record memory newRecord = Record({
            owner: msg.sender,
            combinatedFilesHash: combinatedFilesHash,
            hashAlgorithm: hashAlgorithm,
            ipfsUrl: ipfsUrl,
            authorName: authorName,
            authorEmail: authorEmail,
            blockTimestamp: timestamp
        });

        _records.push(newRecord);
        ownerRecordsMap[msg.sender].push(recordsSize);
        hashRecordMap[combinatedFilesHash] = recordsSize;

        emit NewRegistration(msg.sender, combinatedFilesHash, timestamp);
    }

    function getRecordsByOwner(address ownerAddress) public view returns (Record[] memory) {
        uint256[] memory recordIndexes = ownerRecordsMap[ownerAddress];
        Record[] memory records = new Record[](recordIndexes.length);

        for (uint256 i = 0; i < recordIndexes.length; i++) {
            uint256 recordIndex = recordIndexes[i];
            records[i] = _records[recordIndex];
        }

        return records;
    }
}
