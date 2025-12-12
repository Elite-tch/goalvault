// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Scroll GoalVault
 * @notice A collaborative savings and task accountability protocol on Scroll zkEVM
 * @dev Teams lock funds that release only when financial goals + tasks are completed
 */
contract GoalVault {
    
    // ============ Structs ============
    
    struct Task {
        string description;
        bool isCompleted;
        bool isVerified;
    }
    
    struct Member {
        address wallet;
        uint256 depositedAmount;
        bool hasJoined;
        uint256[] taskIds; // Tracks which tasks belong to this member
    }
    
    struct Vault {
        uint256 id;
        string name;
        address creator;
        uint256 financialGoal; // Total ETH needed from all members
        uint256 totalDeposited;
        uint256 deadline;
        uint256 memberCount;
        uint256 requiredTasksPerMember;
        bool isActive;
        bool fundsReleased;
        VaultStatus status;
    }
    
    enum VaultStatus {
        Active,
        Completed,
        Failed,
        Cancelled
    }
    
    // ============ State Variables ============
    
    uint256 public vaultCounter;
    
    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => address[]) public vaultMembersList; // vaultId => member addresses
    mapping(uint256 => mapping(address => Member)) public vaultMembers; // vaultId => member => data
    mapping(uint256 => mapping(address => mapping(uint256 => Task))) public memberTasks; // vaultId => member => taskId => Task
    
    // ============ Events ============
    
    event VaultCreated(
        uint256 indexed vaultId, 
        string name, 
        address indexed creator,
        uint256 goal,
        uint256 deadline,
        uint256 requiredTasks
    );
    
    event MemberJoined(
        uint256 indexed vaultId, 
        address indexed member, 
        uint256 amount
    );
    
    event TaskCompleted(
        uint256 indexed vaultId, 
        address indexed member, 
        uint256 taskId,
        string description
    );
    
    event TaskVerified(
        uint256 indexed vaultId, 
        address indexed member, 
        uint256 taskId
    );
    
    event FundsReleased(
        uint256 indexed vaultId, 
        uint256 totalAmount,
        VaultStatus finalStatus
    );
    
    event VaultCancelled(
        uint256 indexed vaultId,
        address indexed cancelledBy
    );
    
    // ============ Modifiers ============
    
    modifier onlyVaultCreator(uint256 _vaultId) {
        require(vaults[_vaultId].creator == msg.sender, "Not vault creator");
        _;
    }
    
    modifier vaultExists(uint256 _vaultId) {
        require(_vaultId > 0 && _vaultId <= vaultCounter, "Vault does not exist");
        _;
    }
    
    modifier vaultIsActive(uint256 _vaultId) {
        require(vaults[_vaultId].isActive, "Vault is not active");
        require(block.timestamp < vaults[_vaultId].deadline, "Vault expired");
        _;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Create a new vault with specified goal and tasks
     * @param _name Name of the vault
     * @param _financialGoal Total ETH goal for the entire team
     * @param _durationInDays How many days until deadline
     * @param _requiredTasksPerMember Number of tasks each member must complete
     * @param _taskDescriptions Array of task descriptions (same for all members)
     */
    function createVault(
        string memory _name,
        uint256 _financialGoal,
        uint256 _durationInDays,
        uint256 _requiredTasksPerMember,
        string[] memory _taskDescriptions
    ) external returns (uint256) {
        require(_financialGoal > 0, "Goal must be > 0");
        require(_requiredTasksPerMember > 0, "Must have at least 1 task");
        require(_taskDescriptions.length == _requiredTasksPerMember, "Task count mismatch");
        require(_durationInDays > 0 && _durationInDays <= 365, "Invalid duration");
        
        vaultCounter++;
        uint256 newVaultId = vaultCounter;
        
        Vault storage newVault = vaults[newVaultId];
        newVault.id = newVaultId;
        newVault.name = _name;
        newVault.creator = msg.sender;
        newVault.financialGoal = _financialGoal;
        newVault.deadline = block.timestamp + (_durationInDays * 1 days);
        newVault.requiredTasksPerMember = _requiredTasksPerMember;
        newVault.isActive = true;
        newVault.status = VaultStatus.Active;
        
        emit VaultCreated(
            newVaultId,
            _name,
            msg.sender,
            _financialGoal,
            newVault.deadline,
            _requiredTasksPerMember
        );
        
        // Store task descriptions for later initialization when members join
        for (uint256 i = 0; i < _taskDescriptions.length; i++) {
            // We'll use creator's address as template storage
            memberTasks[newVaultId][address(0)][i] = Task({
                description: _taskDescriptions[i],
                isCompleted: false,
                isVerified: false
            });
        }
        
        return newVaultId;
    }
    
    /**
     * @notice Join a vault by depositing ETH
     * @param _vaultId ID of the vault to join
     */
    function joinVault(uint256 _vaultId) 
        external 
        payable 
        vaultExists(_vaultId)
        vaultIsActive(_vaultId) 
    {
        require(msg.value > 0, "Must deposit ETH");
        require(!vaultMembers[_vaultId][msg.sender].hasJoined, "Already joined");
        
        Vault storage vault = vaults[_vaultId];
        
        // Add to members list
        vaultMembersList[_vaultId].push(msg.sender);
        
        Member storage member = vaultMembers[_vaultId][msg.sender];
        member.wallet = msg.sender;
        member.depositedAmount = msg.value;
        member.hasJoined = true;
        
        // Initialize tasks for this member (copy from template)
        for (uint256 i = 0; i < vault.requiredTasksPerMember; i++) {
            Task memory templateTask = memberTasks[_vaultId][address(0)][i];
            memberTasks[_vaultId][msg.sender][i] = Task({
                description: templateTask.description,
                isCompleted: false,
                isVerified: false
            });
            member.taskIds.push(i);
        }
        
        vault.totalDeposited += msg.value;
        vault.memberCount++;
        
        emit MemberJoined(_vaultId, msg.sender, msg.value);
    }
    
    /**
     * @notice Mark a task as completed (self-reported by member)
     * @param _vaultId Vault ID
     * @param _taskId Task index to mark complete
     */
    function completeTask(uint256 _vaultId, uint256 _taskId) 
        external 
        vaultExists(_vaultId)
        vaultIsActive(_vaultId)
    {
        require(vaultMembers[_vaultId][msg.sender].hasJoined, "Not a member");
        
        Task storage task = memberTasks[_vaultId][msg.sender][_taskId];
        require(!task.isCompleted, "Task already completed");
        
        task.isCompleted = true;
        
        emit TaskCompleted(_vaultId, msg.sender, _taskId, task.description);
    }
    
    /**
     * @notice Verify a member's completed task (creator or peer voting in v2)
     * @param _vaultId Vault ID
     * @param _member Member whose task to verify
     * @param _taskId Task ID to verify
     */
    function verifyTask(uint256 _vaultId, address _member, uint256 _taskId)
        external
        vaultExists(_vaultId)
        onlyVaultCreator(_vaultId)
    {
        Task storage task = memberTasks[_vaultId][_member][_taskId];
        require(task.isCompleted, "Task not completed yet");
        require(!task.isVerified, "Task already verified");
        
        task.isVerified = true;
        
        emit TaskVerified(_vaultId, _member, _taskId);
    }
    
    /**
     * @notice Release funds to all members if goals are met
     * @param _vaultId Vault ID to finalize
     */
    function releaseFunds(uint256 _vaultId) 
        external 
        vaultExists(_vaultId)
    {
        Vault storage vault = vaults[_vaultId];
        require(vault.isActive, "Vault not active");
        require(!vault.fundsReleased, "Funds already released");
        
        // Check if financial goal is met
        require(vault.totalDeposited >= vault.financialGoal, "Financial goal not met");
        
        // Check if all tasks are verified for all members
        address[] memory members = vaultMembersList[_vaultId];
        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            for (uint256 j = 0; j < vault.requiredTasksPerMember; j++) {
                require(
                    memberTasks[_vaultId][member][j].isVerified,
                    "Not all tasks verified"
                );
            }
        }
        
        // All conditions met - release funds
        vault.fundsReleased = true;
        vault.isActive = false;
        vault.status = VaultStatus.Completed;
        
        uint256 totalAmount = vault.totalDeposited;
        
        // Return deposits to each member
        for (uint256 i = 0; i < members.length; i++) {
            address payable member = payable(members[i]);
            uint256 amount = vaultMembers[_vaultId][member].depositedAmount;
            
            if (amount > 0) {
                vaultMembers[_vaultId][member].depositedAmount = 0;
                (bool sent, ) = member.call{value: amount}("");
                require(sent, "Failed to send ETH");
            }
        }
        
        emit FundsReleased(_vaultId, totalAmount, VaultStatus.Completed);
    }
    
    /**
     * @notice Cancel vault and return funds (only creator, only before deadline)
     * @param _vaultId Vault to cancel
     */
    function cancelVault(uint256 _vaultId) 
        external 
        vaultExists(_vaultId)
        onlyVaultCreator(_vaultId)
        vaultIsActive(_vaultId)
    {
        Vault storage vault = vaults[_vaultId];
        vault.isActive = false;
        vault.status = VaultStatus.Cancelled;
        vault.fundsReleased = true;
        
        // Refund all members
        address[] memory members = vaultMembersList[_vaultId];
        for (uint256 i = 0; i < members.length; i++) {
            address payable member = payable(members[i]);
            uint256 amount = vaultMembers[_vaultId][member].depositedAmount;
            
            if (amount > 0) {
                vaultMembers[_vaultId][member].depositedAmount = 0;
                (bool sent, ) = member.call{value: amount}("");
                require(sent, "Refund failed");
            }
        }
        
        emit VaultCancelled(_vaultId, msg.sender);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get vault basic info
     */
    function getVault(uint256 _vaultId) external view returns (Vault memory) {
        return vaults[_vaultId];
    }
    
    /**
     * @notice Get all members of a vault
     */
    function getVaultMembers(uint256 _vaultId) external view returns (address[] memory) {
        return vaultMembersList[_vaultId];
    }
    
    /**
     * @notice Get member's task status
     */
    function getMemberTask(uint256 _vaultId, address _member, uint256 _taskId) 
        external 
        view 
        returns (Task memory) 
    {
        return memberTasks[_vaultId][_member][_taskId];
    }
    
    /**
     * @notice Check if vault goals are achievable
     */
    function canReleaseFunds(uint256 _vaultId) external view returns (bool) {
        Vault storage vault = vaults[_vaultId];
        
        if (vault.totalDeposited < vault.financialGoal) return false;
        
        address[] memory members = vaultMembersList[_vaultId];
        for (uint256 i = 0; i < members.length; i++) {
            for (uint256 j = 0; j < vault.requiredTasksPerMember; j++) {
                if (!memberTasks[_vaultId][members[i]][j].isVerified) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    receive() external payable {}
}
