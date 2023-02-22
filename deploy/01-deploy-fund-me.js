//const helperConfig=require("../helper-hardhat-config")
//const networkConfig=helperConfig.networkConfig
const {
    networkConfig,
    developementChains,
} = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()

// hre - Hardhat Runtime Environment : Stores all the functionalities of HH
// Los parámetros de la función equivalen a: hre.getNamedAccounts y hre.deployments / const { getNamedAccounts,deployments } = hre
module.exports = async ({ getNamedAccounts, deployments }) => {
    // Defines two variables from the object "deployments"
    let ethUsdPriceFeedAddress
    const { deploy, log } = deployments
    // Defines a variable extracted from the function "getNamedAccounts()"
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const args = [ethUsdPriceFeedAddress]
    // if chainId is X use address Y

    if (developementChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    // if the contract doesn't exist, we deploy a minimal version of it for our local testing

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed adress
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developementChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }

    log("------------------------------")
}

module.exports.tags = ["all", "fundme"]
