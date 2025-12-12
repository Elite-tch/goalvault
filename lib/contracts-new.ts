// Contract configuration for Scroll GoalVault v2
// Old contract (keeping for reference)
export const GOALVAULT_ADDRESS = "0xf7ef04b4d03fa5c64e61110f052b9ddee715e8a6" as const;

// NEW CONTRACTS (Updated with new penalty receiver)
export const TASKVAULT_ADDRESS = "0x17d5357e3b5fbb71c191f0607fbd5fc18c3a3808" as const;
export const SAVINGSVAULT_ADDRESS = "0x288ca89d66f7fe28542514dc09296e23c1ed5457" as const;

// Penalty receiver address (UPDATED)
export const PENALTY_RECEIVER = "0x2B6AEdfBacAFff4b393E534f7c1e512a4930dA12" as const;

// TaskVault ABI
export const TASKVAULT_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "uint256", "name": "_stakeAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "_duration", "type": "uint256" },
            { "internalType": "address[]", "name": "_memberAddresses", "type": "address[]" }
        ],
        "name": "createTask",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "_inviteCode", "type": "bytes32" }],
        "name": "stakeWithInvite",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_taskId", "type": "uint256" }],
        "name": "completeTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_taskId", "type": "uint256" }],
        "name": "claimAfterDeadline",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_taskId", "type": "uint256" }],
        "name": "getTask",
        "outputs": [
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "string", "name": "description", "type": "string" },
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" },
            { "internalType": "bool", "name": "isActive", "type": "bool" },
            { "internalType": "uint256", "name": "memberCount", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_taskId", "type": "uint256" },
            { "internalType": "address", "name": "_member", "type": "address" }
        ],
        "name": "getMemberInfo",
        "outputs": [
            { "internalType": "address", "name": "wallet", "type": "address" },
            { "internalType": "uint256", "name": "stakedAmount", "type": "uint256" },
            { "internalType": "bool", "name": "hasStaked", "type": "bool" },
            { "internalType": "bool", "name": "hasCompleted", "type": "bool" },
            { "internalType": "uint256", "name": "completedAt", "type": "uint256" },
            { "internalType": "bytes32", "name": "inviteCode", "type": "bytes32" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_taskId", "type": "uint256" }],
        "name": "getTaskMembers",
        "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "taskCounter",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "name": "inviteCodeToTaskId",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "name": "inviteCodeToMember",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "description", "type": "string" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "TaskCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
            { "indexed": false, "internalType": "bytes32", "name": "inviteCode", "type": "bytes32" }
        ],
        "name": "MemberInvited",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "MemberStaked",
        "type": "event"
    }
] as const;

// SavingsVault ABI
export const SAVINGSVAULT_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "uint256", "name": "_savingsGoal", "type": "uint256" },
            { "internalType": "uint256", "name": "_duration", "type": "uint256" },
            { "internalType": "address", "name": "_payoutAddress", "type": "address" },
            { "internalType": "address[]", "name": "_memberAddresses", "type": "address[]" }
        ],
        "name": "createVault",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "_inviteCode", "type": "bytes32" }],
        "name": "contributeWithInvite",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }],
        "name": "releaseFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }],
        "name": "getVault",
        "outputs": [
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "uint256", "name": "savingsGoal", "type": "uint256" },
            { "internalType": "uint256", "name": "totalContributed", "type": "uint256" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" },
            { "internalType": "address", "name": "payoutAddress", "type": "address" },
            { "internalType": "bool", "name": "isActive", "type": "bool" },
            { "internalType": "bool", "name": "fundsReleased", "type": "bool" },
            { "internalType": "uint256", "name": "memberCount", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" },
            { "internalType": "address", "name": "_member", "type": "address" }
        ],
        "name": "getMemberInfo",
        "outputs": [
            { "internalType": "address", "name": "wallet", "type": "address" },
            { "internalType": "uint256", "name": "contributed", "type": "uint256" },
            { "internalType": "bool", "name": "hasJoined", "type": "bool" },
            { "internalType": "bytes32", "name": "inviteCode", "type": "bytes32" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }],
        "name": "getVaultMembers",
        "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vaultCounter",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "name": "inviteCodeToVaultId",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "name": "inviteCodeToMember",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "savingsGoal", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" },
            { "indexed": false, "internalType": "address", "name": "payoutAddress", "type": "address" }
        ],
        "name": "VaultCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
            { "indexed": false, "internalType": "bytes32", "name": "inviteCode", "type": "bytes32" }
        ],
        "name": "MemberInvited",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "totalContributed", "type": "uint256" }
        ],
        "name": "ContributionMade",
        "type": "event"
    }
] as const;

// Old GoalVault ABI (keeping for backward compatibility)
export const GOALVAULT_ABI = [
    // ... keeping the existing ABI
] as const;

// Time units for duration selection
export const TIME_UNITS = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
    years: 31536000
} as const;

export type TimeUnit = keyof typeof TIME_UNITS;

// Network configuration
export const SCROLL_SEPOLIA = {
    chainId: 534351,
    name: "Scroll Sepolia",
    rpcUrl: "https://sepolia-rpc.scroll.io/",
    blockExplorer: "https://sepolia.scrollscan.com",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
};
