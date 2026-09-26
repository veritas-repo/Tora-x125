// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RepaymentVault is Ownable, ReentrancyGuard {
    IERC20 public immutable settlementToken;
    IERC1155 public immutable impactAsset;

    mapping(uint256 => uint256) public payoutPerUnit;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event RepaymentFunded(uint256 indexed projectId, uint256 payoutPerUnit, uint256 totalFunding);
    event RepaymentClaimed(uint256 indexed projectId, address indexed investor, uint256 units, uint256 amount);

    constructor(address settlementToken_, address impactAsset_) Ownable(msg.sender) {
        settlementToken = IERC20(settlementToken_);
        impactAsset = IERC1155(impactAsset_);
    }

    function fundRepayment(uint256 projectId, uint256 perUnit, uint256 totalFunding) external onlyOwner {
        require(perUnit > 0 && totalFunding > 0, "invalid funding");
        require(settlementToken.transferFrom(msg.sender, address(this), totalFunding), "transfer failed");
        payoutPerUnit[projectId] = perUnit;
        emit RepaymentFunded(projectId, perUnit, totalFunding);
    }

    function claim(uint256 projectId) external nonReentrant {
        require(!claimed[projectId][msg.sender], "already claimed");
        uint256 units = impactAsset.balanceOf(msg.sender, projectId);
        require(units > 0, "no units");
        uint256 amount = units * payoutPerUnit[projectId];
        require(amount > 0, "not funded");
        claimed[projectId][msg.sender] = true;
        require(settlementToken.transfer(msg.sender, amount), "transfer failed");
        emit RepaymentClaimed(projectId, msg.sender, units, amount);
    }
}
