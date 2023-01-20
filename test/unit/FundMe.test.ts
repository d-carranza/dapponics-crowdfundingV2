import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { assert, expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";
// import { FundMe, MockV3Aggregator } from "../../typechain-types";

developmentChains.includes(network.name)
  ? describe("FundMe", async function () {
      let deployer: string;
      let fundMe: any;
      let mockV3Aggregator: any;

      const sendValue = ethers.utils.parseEther("1");

      beforeEach(async function () {
        // deploy contract using HardHat-deploy
        // populate the contract's variables
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer); // This function object comes with a provider

        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async function () {
        it("Sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async function () {
        it("Fails if you dont send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWithCustomError(
            fundMe,
            "FundMe__InsufficientEth"
          );
        });

        it("Updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });

        it("Withdraw eth from a single funder", async function () {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("Allows us to withdraw with multiple funders", async function () {
          // Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make sure that the funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted;
          for (let i = 1; i < 6; i++) {
            await expect(fundMe.getAddressToAmountFunded(accounts[i]), "0");
          }
        });

        it("Only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const attackerConnectedContract = await fundMe.connect(accounts[i]);
            await expect(attackerConnectedContract.withdraw()).to.be.reverted;
          }
        });
      });
    })
  : describe.skip;
