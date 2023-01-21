import { assert } from "chai";
import { ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { FundMe } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe: FundMe;
      let deployer: SignerWithAddress;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);

        assert.equal(endingBalance.toString(), "0");
      });
    });
