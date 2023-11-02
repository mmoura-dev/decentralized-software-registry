import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SoftwareRegistry", function () {
    async function deploySoftwareResgistryFixture() {
        function stringToByteArray(input: string) {
            const result = new Uint8Array(input.length / 2);

            for (let i = 0; i < input.length; i += 2) {
                result[i / 2] = parseInt(input.substr(i, 2), 16);
            }

            return result;
        }

        const [addr0, addr1, addr2] = await ethers.getSigners();
        const softwareRegistry = await ethers.deployContract("SoftwareRegistry");
        const hashString = "a5f4f02d5f3995b9c4a8895c96a22e48f2ef69600e72a6a8f596a8d09c6ab003";
        const sampleRecord = {
            hash: stringToByteArray(hashString),
            ipfsUrl: "ipfs://lorem.ipsum/QmRmkky7qQBjCAU2gFUqfy3NXD7BPq8YVLPM7GHXBz7b5P",
            authorName: "John Doe",
            authorEmail: "john.doe@mail.com"
        };
        return { softwareRegistry, sampleRecord, hashString, stringToByteArray, addr0, addr1, addr2 };
    }

    it("Should returns the newly added registration", async function () {
        const { softwareRegistry, sampleRecord, hashString, addr0 } = await loadFixture(
            deploySoftwareResgistryFixture);

        expect(await softwareRegistry.getRecordsByOwner(addr0.address)).to.deep.equals(
            []);

        await softwareRegistry.createRecord(sampleRecord.hash,
            sampleRecord.ipfsUrl, sampleRecord.authorName, sampleRecord.authorEmail);

        const result = await softwareRegistry.getRecordsByOwner(addr0.address);

        expect(result).to.have.lengthOf(1);
        expect(result[0].slice(0, -1)).to.deep.equals([
            addr0.address,
            "0x" + hashString,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            sampleRecord.authorEmail]);
    });

    it("Should fail because authorName is an empty string", async function () {
        const { softwareRegistry, sampleRecord } = await loadFixture(
            deploySoftwareResgistryFixture);

        await expect(softwareRegistry.createRecord(
            sampleRecord.hash,
            sampleRecord.ipfsUrl,
            "",
            sampleRecord.authorEmail)).to.be.revertedWith("Author name cannot be an empty string");
    });

    it("Should fail because authorEmail is an empty string", async function () {
        const { softwareRegistry, sampleRecord } = await loadFixture(
            deploySoftwareResgistryFixture);

        await expect(softwareRegistry.createRecord(
            sampleRecord.hash,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            "")).to.be.revertedWith("Author email cannot be an empty string");
    });

    it("Should transfer ownership of a record", async function () {
        const { softwareRegistry, sampleRecord, addr0, addr1 } = await loadFixture(
            deploySoftwareResgistryFixture);

        await softwareRegistry.createRecord(sampleRecord.hash, sampleRecord.ipfsUrl, sampleRecord.authorName, sampleRecord.authorEmail);

        const result = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        await softwareRegistry.transferOwnership(result.recordIndex, addr1.address);

        const updatedRecord = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        expect(updatedRecord.owner).to.equal(addr1.address);

        const oldOwnerRecords = await softwareRegistry.getRecordsByOwner(addr0.address);

        expect(oldOwnerRecords.length).to.equal(0);
    });

    it("Should fail to transfer ownership with an invalid record index", async function () {
        const { softwareRegistry, sampleRecord, addr1 } = await loadFixture(
            deploySoftwareResgistryFixture);

        await expect(softwareRegistry.transferOwnership(12345, addr1.address)).to.be.revertedWith("Invalid record index");
    });

    it("Should fail to transfer ownership with the wrong sender", async function () {
        const { softwareRegistry, sampleRecord, addr0, addr1, addr2 } = await loadFixture(
            deploySoftwareResgistryFixture);

        await softwareRegistry.createRecord(sampleRecord.hash, sampleRecord.ipfsUrl, sampleRecord.authorName, sampleRecord.authorEmail);

        const result = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        await expect(softwareRegistry.connect(addr2).transferOwnership(result.recordIndex, addr1.address)).to.be.revertedWith("Only the current owner can transfer ownership");
    });

    it("Should fail to transfer ownership to address zero", async function () {
        const { softwareRegistry, sampleRecord, addr0, addr1 } = await loadFixture(
            deploySoftwareResgistryFixture);

        await softwareRegistry.createRecord(sampleRecord.hash, sampleRecord.ipfsUrl, sampleRecord.authorName, sampleRecord.authorEmail);

        const result = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        await expect(softwareRegistry.transferOwnership(result.recordIndex, ethers.constants.AddressZero)).to.be.revertedWith("New owner address cannot be zero");
    });

    it("Should get a record by hash", async function () {
        const { softwareRegistry, sampleRecord, hashString } = await loadFixture(deploySoftwareResgistryFixture);

        await softwareRegistry.createRecord(sampleRecord.hash, sampleRecord.ipfsUrl, sampleRecord.authorName, sampleRecord.authorEmail);

        const result = await softwareRegistry.getRecordByHash(sampleRecord.hash);

        expect(result.owner).to.equal(addr0.address);
        expect(result.combinatedFilesHash).to.deep.equal(sampleRecord.hash);
        expect(result.ipfsUrl).to.equal(sampleRecord.ipfsUrl);
        expect(result.authorName).to.equal(sampleRecord.authorName);
        expect(result.authorEmail).to.equal(sampleRecord.authorEmail);
    });

    it("Should fail to get a non-existent record by hash", async function () {
        const { softwareRegistry, sampleRecord } = await loadFixture(deploySoftwareResgistryFixture);
        const nonExistentHash = "nonexistenthash"; // Use a hash that does not exist

        await expect(softwareRegistry.getRecordByHash(nonExistentHash)).to.be.revertedWith("Record not found for the given hash");
    });
});