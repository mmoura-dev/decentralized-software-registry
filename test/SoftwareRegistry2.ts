import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SoftwareRegistry", function () {
    async function deploySoftwareResgistryFixture() {
        const [addr0, addr1, addr2] = await ethers.getSigners();
        const softwareRegistry = await ethers.deployContract("SoftwareRegistry");
        const sampleRecord = {
            hash: "f7c387a93b768133fe507de0e2e11ab8ba2ba21a",
            hashAlgorithm: 0,
            ipfsUrl: "ipfs://lorem.ipsum/QmRmkky7qQBjCAU2gFUqfy3NXD7BPq8YVLPM7GHXBz7b5P",
            authorName: "John Doe",
            authorEmail: "john.doe@mail.com"
        };
        return { softwareRegistry, sampleRecord, addr0, addr1, addr2 };
    }

    it("Should returns the newly added registration", async function () {
        const { softwareRegistry, sampleRecord, addr0 } = await loadFixture(
            deploySoftwareResgistryFixture);

        expect(await softwareRegistry.getRecordsByOwner(addr0.address)).to.deep.equals(
            []);

        await softwareRegistry.createRecord(sampleRecord.hash, sampleRecord.hashAlgorithm,
            sampleRecord.ipfsUrl, sampleRecord.authorName, sampleRecord.authorEmail);

        const result = await softwareRegistry.getRecordsByOwner(addr0.address)

        expect(result).to.have.lengthOf(1);
        expect(result[0].slice(0, -1)).to.deep.equals([
            addr0.address,
            sampleRecord.hash,
            sampleRecord.hashAlgorithm,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            sampleRecord.authorEmail]);
    })

    it("Should get a record by hash", async function () {
        const { softwareRegistry, sampleRecord } = await loadFixture(deploySoftwareResgistryFixture);

        // Add the record
        await softwareRegistry.createRecord(
            sampleRecord.hash,
            sampleRecord.hashAlgorithm,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            sampleRecord.authorEmail
        );

        // Get the record by hash
        const result = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        // Assert that the returned record matches the expected values
        expect(result.owner).to.equal(addr0.address); // Assuming the first address (addr0) is the owner
        expect(result.combinatedFilesHash).to.equal(sampleRecord.hash);
        expect(result.hashAlgorithm).to.equal(sampleRecord.hashAlgorithm);
        expect(result.ipfsUrl).to.equal(sampleRecord.ipfsUrl);
        expect(result.authorName).to.equal(sampleRecord.authorName);
        expect(result.authorEmail).to.equal(sampleRecord.authorEmail);
    });

    it("Should fail to get a non-existent record by hash", async function () {
        const { softwareRegistry } = await loadFixture(deploySoftwareResgistryFixture);
        const nonExistentHash = "nonexistenthash"; // Use a hash that does not exist

        try {
            await softwareRegistry.getRecordByHash(nonExistentHash);
            assert.fail("Expected a revert");
        } catch (error) {
            expect(error.message).to.include("Record not found for the given hash");
        }
    });

    it("Should transfer ownership of a record", async function () {
        const { softwareRegistry, sampleRecord, addr0, addr1 } = await loadFixture(
            deploySoftwareResgistryFixture);

        // Add a record
        await softwareRegistry.createRecord(
            sampleRecord.hash,
            sampleRecord.hashAlgorithm,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            sampleRecord.authorEmail
        );

        // Get the record by hash
        const result = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        // Transfer ownership to addr1
        await softwareRegistry.transferOwnership(result.recordIndex, addr1.address);

        // Check if ownership has been transferred
        const updatedRecord = await softwareRegistry.getRecordByHash(sampleRecord.hash);
        expect(updatedRecord.owner).to.equal(addr1.address);

        // Ensure the record is removed from the old owner's list
        const oldOwnerRecords = await softwareRegistry.getRecordsByOwner(addr0.address);
        expect(oldOwnerRecords.length).to.equal(0);
    });

    it("Should fail to transfer ownership with an invalid record index", async function () {
        const { softwareRegistry, sampleRecord, addr1 } = await loadFixture(deploySoftwareResgistryFixture);

        // Try to transfer ownership with an invalid record index
        try {
            await softwareRegistry.transferOwnership(12345, addr1.address);
            assert.fail("Expected a revert");
        } catch (error) {
            expect(error.message).to.include("Invalid record index");
        }
    });

    it("Should fail to transfer ownership with the wrong sender", async function () {
        const { softwareRegistry, sampleRecord, addr0, addr1, addr2 } = await loadFixture(
            deploySoftwareResgistryFixture);

        // Add a record
        await softwareRegistry.createRecord(
            sampleRecord.hash,
            sampleRecord.hashAlgorithm,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            sampleRecord.authorEmail
        );

        // Get the record by hash
        const result = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        // Try to transfer ownership with the wrong sender (addr2)
        try {
            await softwareRegistry.connect(addr2).transferOwnership(result.recordIndex, addr1.address);
            assert.fail("Expected a revert");
        } catch (error) {
            expect(error.message).to.include("Only the current owner can transfer ownership");
        }
    });

    it("Should fail to transfer ownership to address zero", async function () {
        const { softwareRegistry, sampleRecord, addr0, addr1 } = await loadFixture(
            deploySoftwareResgistryFixture);

        // Add a record
        await softwareRegistry.createRecord(
            sampleRecord.hash,
            sampleRecord.hashAlgorithm,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            sampleRecord.authorEmail
        );

        // Get the record by hash
        const result = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        // Try to transfer ownership to address zero
        try {
            await softwareRegistry.transferOwnership(result.recordIndex, ethers.constants.AddressZero);
            assert.fail("Expected a revert");
        } catch (error) {
            expect(error.message).to.include("New owner address cannot be zero");
        }
    });
});