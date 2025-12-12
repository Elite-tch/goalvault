import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("Counter", async function () {
  
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should emit the Increment event when calling the inc() function", async function () {
    const counter = await viem.deployContract("contracts/Counter.sol:Counter");

    await viem.assertions.emitWithArgs(
      counter.write.inc().then(hash => publicClient.waitForTransactionReceipt({ hash })),
      counter,
      "Increment",
      [1n],
    );
  });

  it("The sum of the Increment events should match the current value", async function () {
    // fixed: fully qualified name to avoid duplicate Counter.sol files
    const counter = await viem.deployContract("contracts/Counter.sol:Counter");

    const deploymentBlockNumber = await publicClient.getBlockNumber();

    // run a series of increments
    for (let i = 1n; i <= 10n; i++) {
      await counter.write.incBy([i]);
    }

    const events = await publicClient.getContractEvents({
      address: counter.address,
      abi: counter.abi,
      eventName: "Increment",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    let total = 0n;
for (const event of events as any) {
  total += event.args.by; // bypass TypeScript
}

    assert.equal(total, await counter.read.x());
  });
});
