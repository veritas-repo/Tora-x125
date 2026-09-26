// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

/// @title ToraImpactHook
/// @notice Uniswap v4 beforeSwap hook for Tora-x125 impact-asset markets.
/// @dev The hook enforces per-pool market liveness and a maximum absolute swap size.
///      Project verification remains an application/domain responsibility; this hook stores
///      a hash commitment so pool policy can be tied to the reviewed project state.
contract ToraImpactHook is IHooks, Ownable {
    using Hooks for IHooks;
    using PoolIdLibrary for PoolKey;

    struct MarketPolicy {
        bool active;
        uint128 maxAbsSwapAmount;
        bytes32 projectVerificationHash;
    }

    address public immutable poolManager;
    mapping(PoolId => MarketPolicy) public marketPolicies;

    error OnlyPoolManager(address caller);
    error UnexpectedHookCall();
    error HookPoolMismatch(address configuredHook);
    error MarketDisabled(bytes32 poolId);
    error SwapSizeExceeded(bytes32 poolId, uint256 requested, uint256 maximum);

    event MarketPolicyUpdated(
        bytes32 indexed poolId,
        bool active,
        uint128 maxAbsSwapAmount,
        bytes32 indexed projectVerificationHash
    );

    event SwapPolicyChecked(
        bytes32 indexed poolId,
        address indexed sender,
        uint256 absoluteSwapAmount,
        bytes32 indexed projectVerificationHash
    );

    constructor(address _poolManager, address initialOwner) Ownable(initialOwner) {
        require(_poolManager != address(0), "POOL_MANAGER_ZERO");
        poolManager = _poolManager;

        IHooks(this).validateHookPermissions(
            Hooks.Permissions({
                beforeInitialize: false,
                afterInitialize: false,
                beforeAddLiquidity: false,
                afterAddLiquidity: false,
                beforeRemoveLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: true,
                afterSwap: false,
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: false,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            })
        );
    }

    /// @notice Configure the Tora market policy for a v4 pool using this hook.
    function setMarketPolicy(
        PoolKey calldata key,
        bool active,
        uint128 maxAbsSwapAmount,
        bytes32 projectVerificationHash
    ) external onlyOwner {
        if (address(key.hooks) != address(this)) revert HookPoolMismatch(address(key.hooks));

        PoolId poolId = key.toId();
        marketPolicies[poolId] = MarketPolicy({
            active: active,
            maxAbsSwapAmount: maxAbsSwapAmount,
            projectVerificationHash: projectVerificationHash
        });

        emit MarketPolicyUpdated(
            PoolId.unwrap(poolId),
            active,
            maxAbsSwapAmount,
            projectVerificationHash
        );
    }

    /// @notice Judge/tooling helper to preview the exact beforeSwap policy decision.
    function previewSwapPolicy(PoolKey calldata key, SwapParams calldata params)
        external
        view
        returns (
            bool allowed,
            bytes32 poolId,
            uint256 absoluteSwapAmount,
            uint128 maxAbsSwapAmount,
            bytes32 projectVerificationHash
        )
    {
        PoolId id = key.toId();
        MarketPolicy memory policy = marketPolicies[id];
        uint256 amount = _absoluteAmount(params.amountSpecified);
        bool withinLimit = policy.maxAbsSwapAmount == 0 || amount <= policy.maxAbsSwapAmount;

        return (
            policy.active && withinLimit,
            PoolId.unwrap(id),
            amount,
            policy.maxAbsSwapAmount,
            policy.projectVerificationHash
        );
    }

    /// @inheritdoc IHooks
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata
    ) external override returns (bytes4, BeforeSwapDelta, uint24) {
        if (msg.sender != poolManager) revert OnlyPoolManager(msg.sender);

        PoolId id = key.toId();
        MarketPolicy memory policy = marketPolicies[id];
        bytes32 rawPoolId = PoolId.unwrap(id);

        if (!policy.active) revert MarketDisabled(rawPoolId);

        uint256 amount = _absoluteAmount(params.amountSpecified);
        if (policy.maxAbsSwapAmount != 0 && amount > policy.maxAbsSwapAmount) {
            revert SwapSizeExceeded(rawPoolId, amount, policy.maxAbsSwapAmount);
        }

        emit SwapPolicyChecked(rawPoolId, sender, amount, policy.projectVerificationHash);

        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _absoluteAmount(int256 amountSpecified) internal pure returns (uint256) {
        if (amountSpecified >= 0) return uint256(amountSpecified);
        unchecked {
            return uint256(-(amountSpecified + 1)) + 1;
        }
    }

    // Only beforeSwap is permissioned by this hook's address bits.
    function beforeInitialize(address, PoolKey calldata, uint160) external pure override returns (bytes4) {
        revert UnexpectedHookCall();
    }

    function afterInitialize(address, PoolKey calldata, uint160, int24) external pure override returns (bytes4) {
        revert UnexpectedHookCall();
    }

    function beforeAddLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        revert UnexpectedHookCall();
    }

    function afterAddLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external pure override returns (bytes4, BalanceDelta) {
        revert UnexpectedHookCall();
    }

    function beforeRemoveLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        revert UnexpectedHookCall();
    }

    function afterRemoveLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external pure override returns (bytes4, BalanceDelta) {
        revert UnexpectedHookCall();
    }

    function afterSwap(address, PoolKey calldata, SwapParams calldata, BalanceDelta, bytes calldata)
        external
        pure
        override
        returns (bytes4, int128)
    {
        revert UnexpectedHookCall();
    }

    function beforeDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        revert UnexpectedHookCall();
    }

    function afterDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        revert UnexpectedHookCall();
    }
}
