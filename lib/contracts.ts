export const GOALVAULT_ADDRESS = "0xd74a328bee213892470bb1ef64ec0c680c9a7e41" as const;

export const GOALVAULT_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
        ],
        "name": "canReleaseFunds",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
        ],
        "name": "cancelVault",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
        ],
        "name": "finalizeVault",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" },
            { "internalType": "uint256", "name": "_taskId", "type": "uint256" }
        ],
        "name": "completeTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "uint256", "name": "_financialGoal", "type": "uint256" },
            { "internalType": "uint256", "name": "_duration", "type": "uint256" },
            { "internalType": "uint256", "name": "_requiredTasksPerMember", "type": "uint256" },
            { "internalType": "string[]", "name": "_taskDescriptions", "type": "string[]" },
            { "internalType": "address", "name": "_payoutAddress", "type": "address" },
            { "internalType": "address[]", "name": "_allowedMembers", "type": "address[]" },
            { "internalType": "string[]", "name": "_specificTasks", "type": "string[]" }
        ],
        "name": "createVault",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" },
            { "internalType": "address", "name": "_member", "type": "address" },
            { "internalType": "uint256", "name": "_taskId", "type": "uint256" }
        ],
        "name": "getMemberTask",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "bool", "name": "isCompleted", "type": "bool" },
                    { "internalType": "bool", "name": "isVerified", "type": "bool" },
                    { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
                ],
                "internalType": "struct GoalVault.Task",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
        ],
        "name": "getVault",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "string", "name": "name", "type": "string" },
                    { "internalType": "address", "name": "creator", "type": "address" },
                    { "internalType": "uint256", "name": "financialGoal", "type": "uint256" },
                    { "internalType": "uint256", "name": "totalDeposited", "type": "uint256" },
                    { "internalType": "uint256", "name": "deadline", "type": "uint256" },
                    { "internalType": "uint256", "name": "memberCount", "type": "uint256" },
                    { "internalType": "uint256", "name": "requiredTasksPerMember", "type": "uint256" },
                    { "internalType": "address", "name": "payoutAddress", "type": "address" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" },
                    { "internalType": "bool", "name": "fundsReleased", "type": "bool" },
                    { "internalType": "bool", "name": "isPrivate", "type": "bool" },
                    { "internalType": "enum GoalVault.VaultStatus", "name": "status", "type": "uint8" }
                ],
                "internalType": "struct GoalVault.Vault",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
        ],
        "name": "getVaultMembers",
        "outputs": [
            { "internalType": "address[]", "name": "", "type": "address[]" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" },
            { "internalType": "address", "name": "_member", "type": "address" },
            { "internalType": "uint256", "name": "_taskId", "type": "uint256" },
            { "internalType": "address", "name": "_voter", "type": "address" }
        ],
        "name": "hasUserVoted",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
        ],
        "name": "joinVault",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
        ],
        "name": "releaseFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [
            { "internalType": "uint256", "name": "_vaultId", "type": "uint256" },
            { "internalType": "address", "name": "_member", "type": "address" },
            { "internalType": "uint256", "name": "_taskId", "type": "uint256" }
        ],
        "name": "verifyTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "MemberJoined",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" }
        ],
        "name": "VaultFinalized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" },
            { "indexed": false, "internalType": "bool", "name": "success", "type": "bool" }
        ],
        "name": "MemberSettled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "taskId", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "description", "type": "string" }
        ],
        "name": "TaskCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "taskId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "verifiedBy", "type": "address" }
        ],
        "name": "TaskVerified",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "cancelledBy", "type": "address" }
        ],
        "name": "VaultCancelled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "goal", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "requiredTasks", "type": "uint256" },
            { "indexed": false, "internalType": "address", "name": "payoutAddress", "type": "address" }
        ],
        "name": "VaultCreated",
        "type": "event"
    }
] as const;

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

// Vault status enum (matches contract)
export enum VaultStatus {
    Active = 0,
    Completed = 1,
    Failed = 2,
    Cancelled = 3,
}

// TypeScript types
export interface Vault {
    id: bigint;
    name: string;
    creator: string;
    financialGoal: bigint;
    totalDeposited: bigint;
    deadline: bigint;
    memberCount: bigint;
    requiredTasksPerMember: bigint;
    payoutAddress: string;
    isActive: boolean;
    fundsReleased: boolean;
    isPrivate: boolean; // New!
    status: VaultStatus;
}

export interface Task {
    description: string;
    isCompleted: boolean;
    isVerified: boolean;
    voteCount: bigint;
}

export interface Member {
    wallet: string;
    depositedAmount: bigint;
    hasJoined: boolean;
    taskIds: bigint[];
}
