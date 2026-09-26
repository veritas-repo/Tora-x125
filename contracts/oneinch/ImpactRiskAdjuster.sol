// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Context} from "@1inch/swap-vm/contracts/libs/VM.sol";

/// @title ImpactRiskAdjuster
/// @notice Custom Tora-x125 SwapVM instruction using opcode 0xd0 from the unallocated bank.
/// @dev Adjusts the virtual input balance used by downstream SwapVM pricing instructions.
///      A risk premium worsens maker pricing; verified-impact discount improves it.
///      Actual Aqua token balances are not changed by this instruction.
library ImpactRiskAdjuster {
    uint8 internal constant OPCODE = 0xd0;
    uint256 internal constant BPS = 10_000;
    uint16 internal constant MAX_COMPONENT_BPS = 2_000;

    error InvalidArgsLength(uint256 length);
    error AdjustmentOutOfRange(uint16 riskPremiumBps, uint16 impactDiscountBps);

    function build(uint16 riskPremiumBps, uint16 impactDiscountBps)
        internal
        pure
        returns (bytes memory)
    {
        _validate(riskPremiumBps, impactDiscountBps);
        return abi.encodePacked(
            bytes1(OPCODE),
            bytes1(uint8(4)),
            riskPremiumBps,
            impactDiscountBps
        );
    }

    function parse(bytes calldata args)
        internal
        pure
        returns (uint16 riskPremiumBps, uint16 impactDiscountBps)
    {
        if (args.length != 4) revert InvalidArgsLength(args.length);

        assembly ("memory-safe") {
            let word := calldataload(args.offset)
            riskPremiumBps := shr(240, word)
            impactDiscountBps := and(shr(224, word), 0xffff)
        }

        _validate(riskPremiumBps, impactDiscountBps);
    }

    function exec(Context memory ctx, bytes calldata args) internal pure {
        (uint16 riskPremiumBps, uint16 impactDiscountBps) = parse(args);

        if (riskPremiumBps == impactDiscountBps || ctx.swap.balanceIn == 0) return;

        if (riskPremiumBps > impactDiscountBps) {
            uint256 premium = uint256(riskPremiumBps - impactDiscountBps);
            ctx.swap.balanceIn = Math.mulDiv(
                ctx.swap.balanceIn,
                BPS + premium,
                BPS,
                Math.Rounding.Ceil
            );
        } else {
            uint256 discount = uint256(impactDiscountBps - riskPremiumBps);
            ctx.swap.balanceIn = Math.mulDiv(
                ctx.swap.balanceIn,
                BPS - discount,
                BPS
            );
        }
    }

    function _validate(uint16 riskPremiumBps, uint16 impactDiscountBps) private pure {
        if (
            riskPremiumBps > MAX_COMPONENT_BPS ||
            impactDiscountBps > MAX_COMPONENT_BPS
        ) {
            revert AdjustmentOutOfRange(riskPremiumBps, impactDiscountBps);
        }
    }
}
