import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const counter = await viem.deployContract("contracts/Counter.sol:Counter");
  console.log("Counter deployed at", counter.address);
}

main();
