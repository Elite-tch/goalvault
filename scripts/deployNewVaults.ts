import { network } from "hardhat";

async function main() {
    console.log("🚀 Deploying TaskVault and SavingsVault to Scroll Sepolia...\n");

    const { viem } = await network.connect();

    // Deploy TaskVault
    console.log("📝 Deploying TaskVault...");
    const taskVault = await viem.deployContract("contracts/TaskVault.sol:TaskVault");
    console.log("✅ TaskVault deployed!");
    console.log("📍 Address:", taskVault.address);

    // Deploy SavingsVault
    console.log("\n💰 Deploying SavingsVault...");
    const savingsVault = await viem.deployContract("contracts/SavingsVault.sol:SavingsVault");
    console.log("✅ SavingsVault deployed!");
    console.log("📍 Address:", savingsVault.address);

    console.log("\n🎉 All contracts deployed successfully!");
    console.log("\n📝 Summary:");
    console.log("===========");
    console.log(`TaskVault:    ${taskVault.address}`);
    console.log(`SavingsVault: ${savingsVault.address}`);

    console.log("\n🔗 View on Scroll Sepolia Explorer:");
    console.log(`TaskVault:    https://sepolia.scrollscan.com/address/${taskVault.address}`);
    console.log(`SavingsVault: https://sepolia.scrollscan.com/address/${savingsVault.address}`);

    console.log("\n📝 Next steps:");
    console.log("1. Update contract addresses in lib/contracts.ts");
    console.log("2. Optionally verify contracts:");
    console.log(`   npx hardhat verify --network scrollSepolia ${taskVault.address}`);
    console.log(`   npx hardhat verify --network scrollSepolia ${savingsVault.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
