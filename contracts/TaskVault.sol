// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TaskVault - Individual Task Accountability System
 * @notice Team leads create tasks with fixed stakes. Members complete or face penalties.
 */
contract TaskVault {
    
    // ============ Structs ============
    
    struct Task {
        uint256 id;
        string description;
        address creator;
        uint256 stakeAmount; // Fixed amount each member must stake
        uint256 deadline;
        bool isActive;
        uint256 memberCount;
        mapping(address => Member) members;
        address[] memberList;
    }
    
    struct Member {
        address wallet;
        uint256 stakedAmount;
        bool hasStaked;
        bool hasCompleted;
        uint256 completedAt;
        bytes32 inviteCode; // Unique code for this member
    }
    
    // ============ State Variables ============
    
    uint256 public taskCounter;
   address public constant PENALTY_RECEIVER = 0x2B6AEdfBacAFff4b393E534f7c1e512a4930dA12;
    uint256 public constant PENALTY_PERCENTAGE = 10; // 10%
    
    mapping(uint256 => Task) public tasks;
    mapping(bytes32 => uint256) public inviteCodeToTaskId; // Maps invite code to task ID
    mapping(bytes32 => address) public inviteCodeToMember; // Maps invite code to member address
    
    // ============ Events ============
    
    event TaskCreated(
        uint256 indexed taskId,
        string description,
        address indexed creator,
        uint256 stakeAmount,
        uint256 deadline
    );
    
    event MemberInvited(
        uint256 indexed taskId,
        address indexed member,
        bytes32 inviteCode
    );
    
    event MemberStaked(
        uint256 indexed taskId,
        address indexed member,
        uint256 amount
    );
    
    event TaskCompleted(
        uint256 indexed taskId,
        address indexed member,
        uint256 refundAmount
    );
    
    event TaskFailed(
        uint256 indexed taskId,
        address indexed member,
        uint256 refundAmount,
        uint256 penaltyAmount
    );
    
    // ============ Modifiers ============
    
    modifier onlyCreator(uint256 _taskId) {
        require(tasks[_taskId].creator == msg.sender, "Not task creator");
        _;
    }
    
    modifier taskExists(uint256 _taskId) {
        require(_taskId > 0 && _taskId <= taskCounter, "Task does not exist");
        _;
    }
    
    modifier taskIsActive(uint256 _taskId) {
        require(tasks[_taskId].isActive, "Task is not active");
        _;
    }
    
    // ============ Functions ============
    
    /**
     * @notice Create a new task with invite codes for members
     * @param _description Task description
     * @param _stakeAmount Fixed stake amount for each member
     * @param _duration Duration in seconds
     * @param _memberAddresses Array of member addresses to invite
     */
    function createTask(
        string memory _description,
        uint256 _stakeAmount,
        uint256 _duration,
        address[] memory _memberAddresses
    ) external returns (uint256, bytes32[] memory) {
        require(_stakeAmount > 0, "Stake amount must be > 0");
        require(_duration > 0, "Duration must be > 0");
        require(_memberAddresses.length > 0, "Must invite at least 1 member");
        
        taskCounter++;
        uint256 newTaskId = taskCounter;
        
        Task storage newTask = tasks[newTaskId];
        newTask.id = newTaskId;
        newTask.description = _description;
        newTask.creator = msg.sender;
        newTask.stakeAmount = _stakeAmount;
        newTask.deadline = block.timestamp + _duration;
        newTask.isActive = true;
        
        // Generate unique invite codes for each member
        bytes32[] memory inviteCodes = new bytes32[](_memberAddresses.length);
        
        for (uint256 i = 0; i < _memberAddresses.length; i++) {
            address member = _memberAddresses[i];
            require(member != address(0), "Invalid member address");
            
            // Generate unique invite code
            bytes32 inviteCode = keccak256(abi.encodePacked(newTaskId, member, block.timestamp, i));
            
            inviteCodeToTaskId[inviteCode] = newTaskId;
            inviteCodeToMember[inviteCode] = member;
            inviteCodes[i] = inviteCode;
            
            newTask.members[member].wallet = member;
            newTask.members[member].inviteCode = inviteCode;
            newTask.memberList.push(member);
            newTask.memberCount++;
            
            emit MemberInvited(newTaskId, member, inviteCode);
        }
        
        emit TaskCreated(newTaskId, _description, msg.sender, _stakeAmount, newTask.deadline);
        
        return (newTaskId, inviteCodes);
    }
    
    /**
     * @notice Member stakes using their unique invite code
     * @param _inviteCode Unique invite code received from creator
     */
    function stakeWithInvite(bytes32 _inviteCode) external payable {
        uint256 taskId = inviteCodeToTaskId[_inviteCode];
        address expectedMember = inviteCodeToMember[_inviteCode];
        
        require(taskId > 0, "Invalid invite code");
        require(expectedMember == msg.sender, "This invite is not for you");
        require(tasks[taskId].isActive, "Task is not active");
        require(block.timestamp < tasks[taskId].deadline, "Task deadline passed");
        require(!tasks[taskId].members[msg.sender].hasStaked, "Already staked");
        require(msg.value == tasks[taskId].stakeAmount, "Must stake exact amount");
        
        tasks[taskId].members[msg.sender].stakedAmount = msg.value;
        tasks[taskId].members[msg.sender].hasStaked = true;
        
        emit MemberStaked(taskId, msg.sender, msg.value);
    }
    
    /**
     * @notice Member marks task as complete and claims refund
     * @param _taskId Task ID
     */
    function completeTask(uint256 _taskId) external taskExists(_taskId) {
        Task storage task = tasks[_taskId];
        Member storage member = task.members[msg.sender];
        
        require(member.hasStaked, "You haven't staked");
        require(!member.hasCompleted, "Already completed");
        require(block.timestamp < task.deadline, "Deadline passed");
        
        member.hasCompleted = true;
        member.completedAt = block.timestamp;
        
        // Full refund - completed on time
        uint256 refundAmount = member.stakedAmount;
        member.stakedAmount = 0;
        
        (bool sent, ) = msg.sender.call{value: refundAmount}("");
        require(sent, "Refund failed");
        
        emit TaskCompleted(_taskId, msg.sender, refundAmount);
    }
    
    /**
     * @notice Claim refund after deadline (with or without penalty)
     * @param _taskId Task ID
     */
    function claimAfterDeadline(uint256 _taskId) external taskExists(_taskId) {
        Task storage task = tasks[_taskId];
        Member storage member = task.members[msg.sender];
        
        require(member.hasStaked, "You haven't staked");
        require(block.timestamp >= task.deadline, "Deadline not reached");
        
        uint256 stakedAmount = member.stakedAmount;
        require(stakedAmount > 0, "Already claimed");
        
        member.stakedAmount = 0;
        
        if (member.hasCompleted) {
            // Completed on time but claiming late - full refund
            (bool sent, ) = msg.sender.call{value: stakedAmount}("");
            require(sent, "Refund failed");
            
            emit TaskCompleted(_taskId, msg.sender, stakedAmount);
        } else {
            // Failed to complete - 10% penalty
            uint256 penalty = (stakedAmount * PENALTY_PERCENTAGE) / 100;
            uint256 refund = stakedAmount - penalty;
            
            // Send penalty to designated address
            (bool sentPenalty, ) = PENALTY_RECEIVER.call{value: penalty}("");
            require(sentPenalty, "Penalty transfer failed");
            
            // Send refund to member
            (bool sentRefund, ) = msg.sender.call{value: refund}("");
            require(sentRefund, "Refund failed");
            
            emit TaskFailed(_taskId, msg.sender, refund, penalty);
        }
    }
    
    /**
     * @notice Emergency refund if funds are stuck > 30 days past deadline
     * @param _taskId Task ID
     */
    function emergencyRefund(uint256 _taskId) external taskExists(_taskId) {
        Task storage task = tasks[_taskId];
        require(block.timestamp > task.deadline + 30 days, "Too early for emergency refund");
        
        Member storage member = task.members[msg.sender];
        uint256 amount = member.stakedAmount;
        require(amount > 0, "No funds to refund");
        
        member.stakedAmount = 0;
        
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Refund failed");
        
        emit TaskFailed(_taskId, msg.sender, amount, 0); // Reuse event, 0 penalty
    }

    // ============ View Functions ============
    
    function getTask(uint256 _taskId) external view returns (
        uint256 id,
        string memory description,
        address creator,
        uint256 stakeAmount,
        uint256 deadline,
        bool isActive,
        uint256 memberCount
    ) {
        Task storage task = tasks[_taskId];
        return (
            task.id,
            task.description,
            task.creator,
            task.stakeAmount,
            task.deadline,
            task.isActive,
            task.memberCount
        );
    }
    
    function getMemberInfo(uint256 _taskId, address _member) external view returns (
        address wallet,
        uint256 stakedAmount,
        bool hasStaked,
        bool hasCompleted,
        uint256 completedAt,
        bytes32 inviteCode
    ) {
        Member storage member = tasks[_taskId].members[_member];
        return (
            member.wallet,
            member.stakedAmount,
            member.hasStaked,
            member.hasCompleted,
            member.completedAt,
            member.inviteCode
        );
    }
    
    function getTaskMembers(uint256 _taskId) external view returns (address[] memory) {
        return tasks[_taskId].memberList;
    }
    
    receive() external payable {}
}
