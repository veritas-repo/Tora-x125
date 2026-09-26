// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title HookCreate2Factory
/// @notice Minimal CREATE2 factory used to deploy a Uniswap v4 hook at an address
///         whose low-order permission bits match its declared callbacks.
contract HookCreate2Factory {
    error DeploymentFailed();

    event HookDeployed(address indexed hook, bytes32 indexed salt, bytes32 initCodeHash);

    function deploy(bytes32 salt, bytes calldata creationCode) external returns (address deployed) {
        bytes32 initCodeHash = keccak256(creationCode);
        assembly ("memory-safe") {
            let data := mload(0x40)
            calldatacopy(data, creationCode.offset, creationCode.length)
            deployed := create2(0, data, creationCode.length, salt)
        }
        if (deployed == address(0)) revert DeploymentFailed();
        emit HookDeployed(deployed, salt, initCodeHash);
    }

    function computeAddress(bytes32 salt, bytes32 initCodeHash) external view returns (address) {
        return address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(bytes1(0xff), address(this), salt, initCodeHash)
                    )
                )
            )
        );
    }
}
