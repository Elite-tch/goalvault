// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SavingsVault - Group Savings/Contribution System
 * @notice Team creates savings goals. Money locked until deadline. Flexible contributions.
 */
contract SavingsVault {
    
    // ============ Structs ============
    
    struct Vault {
        uint256 id;
        string name;
        address creator;
        uint256 savingsGoal;
        uint256 totalContributed;
        uint256 deadline;
        address payoutAddress; // Where funds go if goal is met
        bool isActive;
        bool fundsReleased;
        uint256 memberCount;
        mapping(address => Member) members;
        address[] memberList;
    }
    
    struct Member {
        address wallet;
        uint256 contributed;
        bool hasJoined;
        bytes32 inviteCode;
    }
    
    // ============ State Variables ============
    
    uint256 public vaultCounter;
    address public constant PENALTY_RECEIVER = 0x2B6AEdfBacAFff4b393E534f7c1e512a4930dA12;
    uint256 public constant PENALTY_PERCENTAGE = 10; // 10%
    
    mapping(uint256 => Vault) public vaults;
    mapping(bytes32 => uint256) public inviteCodeToVaultId;
    mapping(bytes32 => address) public inviteCodeToMember;
    
    // ============ Events ============
    
    event VaultCreated(
        uint256 indexed vaultId,
        string name,
        address indexed creator,
        uint256 savingsGoal,
        uint256 deadline,
        address payoutAddress
    );
    
    event MemberInvited(
        uint256 indexed vaultId,
        address indexed member,
        bytes32 inviteCode
    );
    
    event ContributionMade(
        uint256 indexed vaultId,
        address indexed member,
        uint256 amount,
        uint256 totalContributed
    );
    
    event GoalReached(
        uint256 indexed vaultId,
        uint256 totalAmount,
        address payoutAddress
    );
    
    event GoalNotMet(
        uint256 indexed vaultId,
        uint256 totalAmount,
        uint256 totalPenalty
    );
    
    // ============ Modifiers ============
    
    modifier onlyCreator(uint256 _vaultId) {
        require(vaults[_vaultId].creator == msg.sender, "Not vault creator");
        _;
    }
    
    modifier vaultExists(uint256 _vaultId) {
        require(_vaultId > 0 && _vaultId <= vaultCounter, "Vault does not exist");
        _;
    }
    
    modifier vaultIsActive(uint256 _vaultId) {
        require(vaults[_vaultId].isActive, "Vault is not active");
        _;
    }
    
    // ============ Functions ============
    
    /**
     * @notice Create a new savings vault
     * @param _name Vault name
     * @param _savingsGoal Target amount to save
     * @param _duration Duration in seconds
     * @param _payoutAddress Where funds go if goal is met
     * @param _memberAddresses Array of member addresses to invite
     */
    function createVault(
        string memory _name,
        uint256 _savingsGoal,
        uint256 _duration,
        address _payoutAddress,
        address[] memory _memberAddresses
    ) external returns (uint256, bytes32[] memory) {
        require(_savingsGoal > 0, "Goal must be > 0");
        require(_duration > 0, "Duration must be > 0");
        require(_payoutAddress != address(0), "Invalid payout address");
        require(_memberAddresses.length > 0, "Must invite at least 1 member");
        
        vaultCounter++;
        uint256 newVaultId = vaultCounter;
        
        Vault storage newVault = vaults[newVaultId];
        newVault.id = newVaultId;
        newVault.name = _name;
        newVault.creator = msg.sender;
        newVault.savingsGoal = _savingsGoal;
        newVault.deadline = block.timestamp + _duration;
        newVault.payoutAddress = _payoutAddress;
        newVault.isActive = true;
        
        // Generate unique invite codes
        bytes32[] memory inviteCodes = new bytes32[](_memberAddresses.length);
        
        for (uint256 i = 0; i < _memberAddresses.length; i++) {
            address member = _memberAddresses[i];
            require(member != address(0), "Invalid member address");
            
            bytes32 inviteCode = keccak256(abi.encodePacked(newVaultId, member, block.timestamp, i));
            
            inviteCodeToVaultId[inviteCode] = newVaultId;
            inviteCodeToMember[inviteCode] = member;
            inviteCodes[i] = inviteCode;
            
            newVault.members[member].wallet = member;
            newVault.members[member].inviteCode = inviteCode;
            newVault.memberList.push(member);
            newVault.memberCount++;
            
            emit MemberInvited(newVaultId, member, inviteCode);
        }
        
        emit VaultCreated(newVaultId, _name, msg.sender, _savingsGoal, newVault.deadline, _payoutAddress);
        
        return (newVaultId, inviteCodes);
    }
    
    /**
     * @notice Contribute to vault using invite code
     * @param _inviteCode Unique invite code
     */
    function contributeWithInvite(bytes32 _inviteCode) external payable {
        uint256 vaultId = inviteCodeToVaultId[_inviteCode];
        address expectedMember = inviteCodeToMember[_inviteCode];
        
        require(vaultId > 0, "Invalid invite code");
        require(expectedMember == msg.sender, "This invite is not for you");
        require(vaults[vaultId].isActive, "Vault is not active");
        require(block.timestamp < vaults[vaultId].deadline, "Vault deadline passed");
        require(msg.value > 0, "Must contribute something");
        
        Vault storage vault = vaults[vaultId];
        
        // Check if adding this would exceed goal
        require(
            vault.totalContributed + msg.value <= vault.savingsGoal,
            "Contribution would exceed goal"
        );
        
        if (!vault.members[msg.sender].hasJoined) {
            vault.members[msg.sender].hasJoined = true;
        }
        
        vault.members[msg.sender].contributed += msg.value;
        vault.totalContributed += msg.value;
        
        emit ContributionMade(vaultId, msg.sender, msg.value, vault.totalContributed);
    }
    
    /**
     * @notice Release funds after deadline (creator only)
     * @param _vaultId Vault ID
     */
    function releaseFunds(uint256 _vaultId) 
        external 
        vaultExists(_vaultId)
        onlyCreator(_vaultId)
    {
        Vault storage vault = vaults[_vaultId];
        require(vault.isActive, "Vault not active");
        require(!vault.fundsReleased, "Funds already released");
        require(block.timestamp >= vault.deadline, "Deadline not reached");
        
        vault.fundsReleased = true;
        vault.isActive = false;
        
        uint256 totalAmount = vault.totalContributed;
        
        if (totalAmount >= vault.savingsGoal) {
            // Goal met - send all to payout address
            (bool sent, ) = vault.payoutAddress.call{value: totalAmount}("");
            require(sent, "Payout failed");
            
            emit GoalReached(_vaultId, totalAmount, vault.payoutAddress);
        } else {
            // Goal not met - refund with 10% penalty
            uint256 totalPenalty = 0;
            
            address[] memory members = vault.memberList;
            for (uint256 i = 0; i < members.length; i++) {
                address member = members[i];
                uint256 contributed = vault.members[member].contributed;
                
                if (contributed > 0) {
                    uint256 penalty = (contributed * PENALTY_PERCENTAGE) / 100;
                    uint256 refund = contributed - penalty;
                    
                    totalPenalty += penalty;
                    vault.members[member].contributed = 0;
                    
                    (bool sentRefund, ) = member.call{value: refund}("");
                    require(sentRefund, "Refund failed");
                }
            }
            
            // Send total penalty
            if (totalPenalty > 0) {
                (bool sentPenalty, ) = PENALTY_RECEIVER.call{value: totalPenalty}("");
                require(sentPenalty, "Penalty transfer failed");
            }
            
            emit GoalNotMet(_vaultId, totalAmount, totalPenalty);
        }
    }
    
    // ============ View Functions ============
    
    function getVault(uint256 _vaultId) external view returns (
        uint256 id,
        string memory name,
        address creator,
        uint256 savingsGoal,
        uint256 totalContributed,
        uint256 deadline,
        address payoutAddress,
        bool isActive,
        bool fundsReleased,
        uint256 memberCount
    ) {
        Vault storage vault = vaults[_vaultId];
        return (
            vault.id,
            vault.name,
            vault.creator,
            vault.savingsGoal,
            vault.totalContributed,
            vault.deadline,
            vault.payoutAddress,
            vault.isActive,
            vault.fundsReleased,
            vault.memberCount
        );
    }
    
    function getMemberInfo(uint256 _vaultId, address _member) external view returns (
        address wallet,
        uint256 contributed,
        bool hasJoined,
        bytes32 inviteCode
    ) {
        Member storage member = vaults[_vaultId].members[_member];
        return (
            member.wallet,
            member.contributed,
            member.hasJoined,
            member.inviteCode
        );
    }
    
    function getVaultMembers(uint256 _vaultId) external view returns (address[] memory) {
        return vaults[_vaultId].memberList;
    }
    
    receive() external payable {}
}
