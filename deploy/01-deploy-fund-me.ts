import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../utils/verify";
import { developmentChains, networkConfig } from "../helper-hardhat-config";

const deployFundMe: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId!;

  let ethUsdPriceFeedAddress;

  if (chainId == 31337) {
    // Mock
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    // Modular chain agnostic price feed
    ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!;
  }
  log("-------------------------------------------------------");
  log("Deploying FundMe and waiting for confirmations...");

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`FundMe deployed at ${fundMe.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

export default deployFundMe;

deployFundMe.tags = ["all", "fundMe"];
