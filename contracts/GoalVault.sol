// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Scroll GoalVault
 * @notice A collaborative savings and task accountability protocol on Scroll zkEVM
 * @dev Supports both "Pure Savings" (0 tasks) and "Hybrid" (Savings + Tasks)
 */
contract GoalVault {
    
    // ============ Structs ============
    
    struct Task {
        string description;
        bool isCompleted;
        bool isVerified;
        uint256 voteCount;
        string proof; // URL or text evidence
    }
    
    struct Member {
        address wallet;
        uint256 depositedAmount;
        bool hasJoined;
        uint256[] taskIds;
    }
    
    struct Vault {
        uint256 id;
        string name;
        address creator;
        uint256 financialGoal;
        uint256 totalDeposited;
        uint256 deadline;
        uint256 memberCount;
        uint256 requiredTasksPerMember;
        address payoutAddress;
        bool isActive;
        bool fundsReleased;
        bool isPrivate; // New: Restrict joining to specific addresses
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
    mapping(uint256 => address[]) public vaultMembersList;
    mapping(uint256 => mapping(address => Member)) public vaultMembers;
    mapping(uint256 => mapping(address => mapping(uint256 => Task))) public memberTasks;
    
    // Whitelist for private vaults
    mapping(uint256 => mapping(address => bool)) public isWhitelisted;

    // Pre-assigned tasks for specific members (VaultId => Member => Descriptions)
    mapping(uint256 => mapping(address => string[])) private vaultMemberSpecificTasks;
    
    // Owner for fee collection
    //address public owner = 0xc9B5a83b5dC3aC7056856E69283d1DafF990bEC4;
    address public owner = 0xc9B5A83b5Dc3aC7056856E69283d1DAFF990Bec4;

    
    uint256 public constant PENALTY_PERCENT = 10; // 10% penalty

    // Peer Voting: VaultId => TargetMember => TaskId => Voter => HasVoted
    mapping(uint256 => mapping(address => mapping(uint256 => mapping(address => bool)))) public hasVoted;
    
    // Claim Tracking: VaultId => Member => HasClaimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // ============ Events ============
    
    event VaultCreated(
        uint256 indexed vaultId, 
        string name, 
        address indexed creator,
        uint256 goal,
        uint256 deadline,
        uint256 requiredTasks,
        address payoutAddress
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
        string description,
        string proof
    );
    
    event TaskVerified(
        uint256 indexed vaultId, 
        address indexed member, 
        uint256 taskId,
        address indexed verifiedBy
    );
    

    
    event VaultCancelled(
        uint256 indexed vaultId,
        address indexed cancelledBy
    );

    event MemberSettled(uint256 indexed vaultId, address indexed member, uint256 amount, address recipient, bool success);
    event VaultFinalized(uint256 indexed vaultId);
    event GoalReached(uint256 indexed vaultId, uint256 totalDeposited);
    
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

    modifier onlyMember(uint256 _vaultId) {
        require(vaultMembers[_vaultId][msg.sender].hasJoined, "Not a member");
        _;
    }

    function createVault(
        string memory _name,
        uint256 _financialGoal,
        uint256 _duration, 
        uint256 _requiredTasksPerMember,
        string[] memory _taskDescriptions,
        address _payoutAddress,
        address[] memory _allowedMembers,
        string[] memory _specificTasks // New: Specific tasks
    ) external returns (uint256) {
        require(_financialGoal > 0, "Goal must be > 0");
        require(_duration > 0, "Invalid duration");
        
        // Validation for specific tasks
        if (_allowedMembers.length > 0 && _specificTasks.length > 0) {
            require(_allowedMembers.length == _specificTasks.length, "Member/Task mismatch");
            require(_requiredTasksPerMember == 1, "Specific assignment supports 1 task/member");
        } else if (_requiredTasksPerMember > 0) {
             require(_taskDescriptions.length == _requiredTasksPerMember, "Task count mismatch");
        }
        
        vaultCounter++;
        uint256 newVaultId = vaultCounter;
        
        Vault storage newVault = vaults[newVaultId];
        newVault.id = newVaultId;
        newVault.name = _name;
        newVault.creator = msg.sender;
        newVault.financialGoal = _financialGoal;
        newVault.deadline = block.timestamp + _duration;
        newVault.requiredTasksPerMember = _requiredTasksPerMember;
        newVault.payoutAddress = _payoutAddress;
        newVault.isActive = true;
        newVault.status = VaultStatus.Active;
        
        if (_allowedMembers.length > 0) {
            newVault.isPrivate = true;
            for (uint256 i = 0; i < _allowedMembers.length; i++) {
                address member = _allowedMembers[i];
                isWhitelisted[newVaultId][member] = true;
                
                // Store specific task if provided
                if (_specificTasks.length > 0) {
                    vaultMemberSpecificTasks[newVaultId][member].push(_specificTasks[i]);
                }
            }
        }
        
        emit VaultCreated(
            newVaultId,
            _name,
            msg.sender,
            _financialGoal,
            newVault.deadline,
            _requiredTasksPerMember,
            _payoutAddress
        );
        
        if (_requiredTasksPerMember > 0) {
            for (uint256 i = 0; i < _taskDescriptions.length; i++) {
                memberTasks[newVaultId][address(0)][i] = Task({
                    description: _taskDescriptions[i],
                    isCompleted: false,
                    isVerified: false,
                    voteCount: 0,
                    proof: ""
                });
            }
        }
        
        return newVaultId;
    }
    
    function joinVault(uint256 _vaultId) 
        external 
        payable 
        vaultExists(_vaultId)
        vaultIsActive(_vaultId) 
    {
        require(msg.value > 0, "Must deposit ETH");
        
        Vault storage vault = vaults[_vaultId];
        
        // Hard Cap Check: Cannot exceed financial goal
        require(vault.totalDeposited + msg.value <= vault.financialGoal, "Exceeds vault goal");

        // Logic A: Private Vault (Whitelist Only)
        if (vault.isPrivate) {
            require(isWhitelisted[_vaultId][msg.sender], "Private: Not whitelisted");
        }
        
        // Note: For Public Vaults (Logic B), anyone can join as long as Hard Cap isn't Met.

        // Check if already joined to avoid duplicate list entries
        if (!vaultMembers[_vaultId][msg.sender].hasJoined) {
            vaultMembersList[_vaultId].push(msg.sender);
            vaultMembers[_vaultId][msg.sender].wallet = msg.sender;
            vaultMembers[_vaultId][msg.sender].hasJoined = true;
            vault.memberCount++;
            
            // Initialize tasks if any
            if (vault.requiredTasksPerMember > 0) {
                 // ... Task Init Logic ...
                _initMemberTasks(_vaultId, msg.sender);
            }
        }
        
        // Add to deposit (supports multiple deposits from same user)
        vaultMembers[_vaultId][msg.sender].depositedAmount += msg.value;
        vault.totalDeposited += msg.value;
        
        emit MemberJoined(_vaultId, msg.sender, msg.value);
    }

    function _initMemberTasks(uint256 _vaultId, address _member) internal {
        Vault storage vault = vaults[_vaultId];
        // Check for specific pre-assigned tasks first
        string[] memory specific = vaultMemberSpecificTasks[_vaultId][_member];
        
        if (specific.length > 0) {
            memberTasks[_vaultId][_member][0] = Task({
                description: specific[0],
                isCompleted: false,
                isVerified: false,
                voteCount: 0,
                proof: ""
            });
            vaultMembers[_vaultId][_member].taskIds.push(0);
        } else {
            // Use template tasks
            for (uint256 i = 0; i < vault.requiredTasksPerMember; i++) {
                Task memory templateTask = memberTasks[_vaultId][address(0)][i];
                memberTasks[_vaultId][_member][i] = Task({
                    description: templateTask.description,
                    isCompleted: false,
                    isVerified: false,
                    voteCount: 0,
                    proof: ""
                });
                vaultMembers[_vaultId][_member].taskIds.push(i);
            }
        }
    }
    
    function completeTask(uint256 _vaultId, uint256 _taskId, string memory _proof) 
        external 
        vaultExists(_vaultId)
        vaultIsActive(_vaultId)
        onlyMember(_vaultId)
    {
        Task storage task = memberTasks[_vaultId][msg.sender][_taskId];
        require(!task.isCompleted, "Task already completed");
        
        task.isCompleted = true;
        task.proof = _proof;
        
        emit TaskCompleted(_vaultId, msg.sender, _taskId, task.description, _proof);
    }
    
    function verifyTask(uint256 _vaultId, address _member, uint256 _taskId)
        external
        vaultExists(_vaultId)
        vaultIsActive(_vaultId)
        onlyMember(_vaultId)
    {
        Task storage task = memberTasks[_vaultId][_member][_taskId];
        require(task.isCompleted, "Task not completed yet");
        require(!task.isVerified, "Task already verified");
        require(!hasVoted[_vaultId][_member][_taskId][msg.sender], "Already voted");
        
        hasVoted[_vaultId][_member][_taskId][msg.sender] = true;
        task.voteCount++;
        
        Vault storage vault = vaults[_vaultId];
        if (task.voteCount * 2 > vault.memberCount) {
            task.isVerified = true;
        }
        
        emit TaskVerified(_vaultId, _member, _taskId, msg.sender);
    }

    function claimFunds(uint256 _vaultId) external vaultExists(_vaultId) {
        Vault storage vault = vaults[_vaultId];
        require(vault.fundsReleased, "Claims not enabled yet");
        require(!hasClaimed[_vaultId][msg.sender], "Already claimed");
        
        Member storage member = vaultMembers[_vaultId][msg.sender];
        uint256 amount = member.depositedAmount;
        require(amount > 0, "No funds to claim");

        // Mark as claimed (Reentrancy protection)
        hasClaimed[_vaultId][msg.sender] = true;
        member.depositedAmount = 0;

        // 1. If financial goal NOT met -> Refund everyone 100%
        if (vault.totalDeposited < vault.financialGoal) {
             (bool sent, ) = payable(msg.sender).call{value: amount}("");
             require(sent, "Refund failed");
             emit MemberSettled(_vaultId, msg.sender, amount, msg.sender, false);
             return;
        }

        // 2. Financial Goal Met -> Check Tasks
        bool allVerified = true;
        if (vault.requiredTasksPerMember > 0) {
            for (uint256 j = 0; j < vault.requiredTasksPerMember; j++) {
                if (!memberTasks[_vaultId][msg.sender][j].isVerified) {
                    allVerified = false;
                    break;
                }
            }
        }

        // 3. Payout Logic
        if (allVerified) {
            // Success! Send to Payout Address (or self if 0x0)
            address payable dest = vault.payoutAddress != address(0) ? payable(vault.payoutAddress) : payable(msg.sender);
            (bool sent, ) = dest.call{value: amount}("");
            require(sent, "Transfer failed");
            emit MemberSettled(_vaultId, msg.sender, amount, dest, true);
        } else {
            // Failed tasks -> Apply Penalty
            uint256 penalty = (amount * PENALTY_PERCENT) / 100;
            uint256 refund = amount - penalty;
            
            // Refund remainder to user
            (bool sent, ) = payable(msg.sender).call{value: refund}("");
            require(sent, "Refund failed");
            
            // Penalty sent to Protocol Owner
            (bool sentFee, ) = payable(owner).call{value: penalty}("");
            require(sentFee, "Fee failed");
            
             emit MemberSettled(_vaultId, msg.sender, refund, msg.sender, false);
        }
    }
    
    function finalizeVault(uint256 _vaultId) external vaultExists(_vaultId) {
        Vault storage vault = vaults[_vaultId];
        require(block.timestamp > vault.deadline, "Vault has not finished yet");
        require(!vault.fundsReleased, "Already finalized");
        
        // Just toggle the state. Actual payout happens via claimFunds()
        vault.fundsReleased = true;
        vault.isActive = false;
        vault.status = VaultStatus.Completed;
        
        emit VaultFinalized(_vaultId);
    }
    
    function emergencyRefund(uint256 _vaultId) external vaultExists(_vaultId) {
        Vault storage vault = vaults[_vaultId];
        require(!vault.fundsReleased, "Vault already finalized"); 
        require(block.timestamp > vault.deadline + 30 days, "Too early");

        Member storage member = vaultMembers[_vaultId][msg.sender];
        uint256 amount = member.depositedAmount;
        require(amount > 0, "No funds to refund");

        member.depositedAmount = 0;
        
        if (vault.totalDeposited >= amount) {
            vault.totalDeposited -= amount;
        }

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Refund failed");
        
        emit MemberSettled(_vaultId, msg.sender, amount, msg.sender, false);
    }

    // ============ View Functions ============
    
    function getVault(uint256 _vaultId) external view returns (Vault memory) {
        return vaults[_vaultId];
    }
    
    function getVaultMembers(uint256 _vaultId) external view returns (address[] memory) {
        return vaultMembersList[_vaultId];
    }
    
    function getMemberTask(uint256 _vaultId, address _member, uint256 _taskId) 
        external 
        view 
        returns (Task memory) 
    {
        return memberTasks[_vaultId][_member][_taskId];
    }
    
    function canReleaseFunds(uint256 _vaultId) public view returns (bool) {
        Vault storage vault = vaults[_vaultId];
        
        if (vault.totalDeposited < vault.financialGoal) return false;
        
        if (vault.requiredTasksPerMember > 0) {
            address[] memory members = vaultMembersList[_vaultId];
            for (uint256 i = 0; i < members.length; i++) {
                for (uint256 j = 0; j < vault.requiredTasksPerMember; j++) {
                    if (!memberTasks[_vaultId][members[i]][j].isVerified) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    function hasUserVoted(uint256 _vaultId, address _member, uint256 _taskId, address _voter) external view returns (bool) {
        return hasVoted[_vaultId][_member][_taskId][_voter];
    }

    function hasUserClaimed(uint256 _vaultId, address _member) external view returns (bool) {
        return hasClaimed[_vaultId][_member];
    }
    
    receive() external payable {}
}
