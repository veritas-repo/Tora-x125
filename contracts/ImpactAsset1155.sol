// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ImpactAsset1155 is ERC1155, Ownable {
    struct Project {
        string name;
        string projectType;
        string location;
        string metadataURI;
        uint256 faceValue;
        uint256 maturity;
        uint256 impactScore;
        uint256 riskScore;
        bool active;
    }

    uint256 public nextProjectId = 1;
    mapping(uint256 => Project) public projects;

    event ProjectCreated(uint256 indexed projectId, string name, uint256 units, address indexed recipient);
    event ProjectMetricsUpdated(uint256 indexed projectId, uint256 impactScore, uint256 riskScore);

    constructor() ERC1155("") Ownable(msg.sender) {}

    function createProject(
        address recipient,
        uint256 units,
        string calldata name,
        string calldata projectType,
        string calldata location,
        string calldata metadataURI,
        uint256 faceValue,
        uint256 maturity,
        uint256 impactScore,
        uint256 riskScore
    ) external onlyOwner returns (uint256 projectId) {
        require(recipient != address(0), "recipient=0");
        require(units > 0, "units=0");
        require(maturity > block.timestamp, "maturity");

        projectId = nextProjectId++;
        projects[projectId] = Project({
            name: name,
            projectType: projectType,
            location: location,
            metadataURI: metadataURI,
            faceValue: faceValue,
            maturity: maturity,
            impactScore: impactScore,
            riskScore: riskScore,
            active: true
        });

        _mint(recipient, projectId, units, "");
        emit ProjectCreated(projectId, name, units, recipient);
    }

    function setProjectMetrics(uint256 projectId, uint256 impactScore, uint256 riskScore) external onlyOwner {
        require(projects[projectId].active, "unknown project");
        projects[projectId].impactScore = impactScore;
        projects[projectId].riskScore = riskScore;
        emit ProjectMetricsUpdated(projectId, impactScore, riskScore);
    }

    function setProjectActive(uint256 projectId, bool active) external onlyOwner {
        require(bytes(projects[projectId].name).length != 0, "unknown project");
        projects[projectId].active = active;
    }

    function uri(uint256 projectId) public view override returns (string memory) {
        return projects[projectId].metadataURI;
    }
}
