// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract SoftwareRegistry {
    struct Record {
        address owner;
        string sha256Hash;
        string ipfsUrl;
        string authorName;
        string authorEmail;
        uint256 blockTimestamp;
    }

    Record[] _records;
    mapping(address => uint256[]) ownerRecordsMap;
    mapping(string => uint256) hashRecordMap;

    event NewRegistration(
        address indexed _owner,
        string _hash,
        uint256 _timestamp
    );

    function createRecord(
        string memory combinatedFilesHash,
        string memory ipfsUrl,
        string memory authorName,
        string memory authorEmail
    ) public {
        require(bytes(combinatedFilesHash).length > 0, "Hash cannot be empty");

        uint256 timestamp = block.timestamp;
        uint256 recordsSize = _records.length;

        Record memory newRecord = Record({
            owner: msg.sender,
            sha256Hash: combinatedFilesHash,
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

    function getRecordsByOwner(
        address ownerAddress
    ) public view returns (Record[] memory) {
        uint256[] memory recordIndexes = ownerRecordsMap[ownerAddress];
        Record[] memory records = new Record[](recordIndexes.length);

        for (uint256 i = 0; i < recordIndexes.length; i++) {
            uint256 recordIndex = recordIndexes[i];
            records[i] = _records[recordIndex];
        }

        return records;
    }

    function transferOwnership(uint256 recordIndex, address newOwner) public {
        require(recordIndex < _records.length, "Invalid record index");
        require(
            msg.sender == _records[recordIndex].owner,
            "Only the current owner can transfer ownership"
        );
        require(newOwner != address(0), "New owner address cannot be zero");

        _records[recordIndex].owner = newOwner;

        uint256[] storage ownerRecordIndexes = ownerRecordsMap[msg.sender];
        for (uint256 i = 0; i < ownerRecordIndexes.length; i++) {
            if (ownerRecordIndexes[i] == recordIndex) {
                ownerRecordIndexes[i] = ownerRecordIndexes[
                    ownerRecordIndexes.length - 1
                ];
                ownerRecordIndexes.pop();
                break;
            }
        }

        ownerRecordsMap[newOwner].push(recordIndex);

        emit OwnershipTransferred(msg.sender, newOwner, recordIndex);
    }

    event OwnershipTransferred(
        address indexed from,
        address indexed to,
        uint256 recordIndex
    );

    function getRecordByHash(
        string memory combinatedFilesHash
    ) public view returns (Record memory) {
        uint256 recordIndex = hashRecordMap[combinatedFilesHash];
        require(recordIndex > 0, "Record not found for the given hash");

        return _records[recordIndex - 1];
    }
}
