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
        const hashString = "a5f4f02d5f3995b9c4a8895c96a22e48f2ef69600e72a6a8f596a8d09c6ab003"
        const sampleRecord = {
            hash: stringToByteArray(hashString),
            ipfsUrl: "ipfs://lorem.ipsum/QmRmkky7qQBjCAU2gFUqfy3NXD7BPq8YVLPM7GHXBz7b5P",
            authorName: "John Doe",
            authorEmail: "john.doe@mail.com"
        };
        return { softwareRegistry, sampleRecord, hashString, stringToByteArray, addr0, addr1, addr2 };
    }

    it("Should returns the newly added registration", async function () {
        const { softwareRegistry, sampleRecord, hashString, addr0,  } = await loadFixture(
            deploySoftwareResgistryFixture);

        expect(await softwareRegistry.getRecordsByOwner(addr0.address)).to.deep.equals(
            []);

        await softwareRegistry.createRecord(sampleRecord.hash,
            sampleRecord.ipfsUrl, sampleRecord.authorName, sampleRecord.authorEmail);

        const result = await softwareRegistry.getRecordsByOwner(addr0.address)

        expect(result).to.have.lengthOf(1);
        expect(result[0].slice(0, -1)).to.deep.equals([
            addr0.address,
            "0x" + hashString,
            sampleRecord.ipfsUrl,
            sampleRecord.authorName,
            sampleRecord.authorEmail]);
    })
});
