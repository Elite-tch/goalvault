import { network } from "hardhat";

async function main() {
    console.log("Deploying GoalVault to Scroll Sepolia...");

    const { viem } = await network.connect();

    // Deploy GoalVault contract
    const goalVault = await viem.deployContract("contracts/GoalVault.sol:GoalVault");

    console.log("✅ GoalVault deployed successfully!");
    console.log("📍 Contract Address:", goalVault.address);
    console.log("\n🔗 View on Scroll Sepolia Explorer:");
    console.log(`https://sepolia.scrollscan.com/address/${goalVault.address}`);
    console.log("\n📝 Next steps:");
    console.log(`1. Verify contract: npx hardhat verify --network scrollSepolia ${goalVault.address}`);
    console.log(`2. Update frontend contract address in your config`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
