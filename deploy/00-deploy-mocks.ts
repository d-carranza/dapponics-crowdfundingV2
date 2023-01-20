import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const DECIMALS = "0";
const INITIAL_PRICE = "200000000000"; //2000

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    log("Local network detected! Deploying mocks...");

    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INITIAL_PRICE],
      log: true,
    });

    log("Mocks deployed!");
    log("-------------------------------------------------------");
    log(
      "You are deploying to a local network, you'll need a local network running to interact"
    );
    log(
      "Please run 'yarn hardhat console' to interact with the deployed smart contracts!"
    );
    log("-------------------------------------------------------");
  }
};

export default deployMocks;
deployMocks.tags = ["all", "mocks"];
