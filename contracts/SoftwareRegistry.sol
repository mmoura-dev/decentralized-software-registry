// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract SoftwareRegistry {
    struct Record {
        address owner;
        bytes32 sha256Hash;
        string ipfsCid;
        string authorName;
        string authorEmail;
        uint256 blockTimestamp;
    }

    Record[] _records;
    mapping(address => uint256[]) ownerRecordsMap;
    mapping(bytes32 => uint256) hashRecordMap;

    event NewRegistration(
        address indexed _owner,
        bytes32 _hash,
        uint256 _timestamp
    );

    event OwnershipTransferred(
        address indexed from,
        address indexed to,
        uint256 recordIndex
    );

    function createRecord(
        bytes32 combinatedFilesHash,
        string memory ipfsCid,
        string memory authorName,
        string memory authorEmail
    ) public {
        require(combinatedFilesHash.length > 0, "Hash cannot be empty");
        require(bytes(authorName).length > 0, "Author name cannot be empty string");

        uint256 timestamp = block.timestamp;
        uint256 recordsSize = _records.length;

        Record memory newRecord = Record({
            owner: msg.sender,
            sha256Hash: combinatedFilesHash,
            ipfsCid: ipfsCid,
            authorName: authorName,
            authorEmail: authorEmail,
            blockTimestamp: timestamp
        });

        _records.push(newRecord);
        ownerRecordsMap[msg.sender].push(recordsSize);
        hashRecordMap[combinatedFilesHash] = recordsSize;

        emit NewRegistration(msg.sender, combinatedFilesHash, timestamp);
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

    function getRecordByHash(
        bytes32 sha256Hash
    ) public view returns (Record memory) {
        uint256 recordIndex = hashRecordMap[sha256Hash];
        require(recordIndex > 0, "Record not found for the given hash");

        return _records[recordIndex - 1];
    }
}
