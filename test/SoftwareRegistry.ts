import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SoftwareRegistry", function () {
    async function deploySoftwareResgistryFixture() {
        const [addr0, addr1, addr2] = await ethers.getSigners();
        const softwareRegistry = await ethers.deployContract("SoftwareRegistry");
        const sampleRecord = {
            hash: "f7c387a93b768133fe507de0e2e11ab8ba2ba21a",
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

        await softwareRegistry.createRecord(sampleRecord.hash,
            sampleRecord.ipfsUrl, sampleRecord.authorName, sampleRecord.authorEmail);

        const result = await softwareRegistry.getRecordsByOwner(addr0.address)

        expect(result).to.have.lengthOf(1);
        expect(result[0].slice(0, -1)).to.deep.equals([
            addr0.address,
            sampleRecord.hash,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            sampleRecord.authorEmail]);
    })
});
