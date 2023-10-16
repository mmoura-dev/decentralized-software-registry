import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SoftwareRegistry", function() {
    async function deploySoftwareResgistryFixture() {
        const [addr0, addr1, addr2] = await ethers.getSigners();
        const registry = await ethers.deployContract("SoftwareRegistry");
        return { registry, addr0, addr1, addr2 }
    }

    it("Should add a new commit to owner", async function() {
        const { registry, addr0 } = await loadFixture(
            deploySoftwareResgistryFixture);
        
        await registry.registerCommit("sha1", "author name", "author email", "2023")
        const commits = await registry.getCommitsByOwner(addr0.address)
        console.log();
        
        expect(await registry.getCommitsByOwner(addr0.address)).to.deep.equals(
            [[addr0.address, "sha1", "author name", "author email", "2023"]])
    })
});
