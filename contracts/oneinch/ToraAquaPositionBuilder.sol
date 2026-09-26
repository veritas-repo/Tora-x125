// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ISwapVM} from "@1inch/swap-vm/contracts/interfaces/ISwapVM.sol";
import {MakerTraitsLib} from "@1inch/swap-vm/contracts/libs/MakerTraits.sol";
import {TakerTraitsLib} from "@1inch/swap-vm/contracts/libs/TakerTraits.sol";
import {Deadline, Salt} from "@1inch/swap-vm/contracts/instructions/Controls.sol";
import {Decay} from "@1inch/swap-vm/contracts/instructions/Decay.sol";
import {FeeFlatIn} from "@1inch/swap-vm/contracts/instructions/FeeFlat.sol";
import {XYCConcentrateSwap} from "@1inch/swap-vm/contracts/instructions/XYCConcentrate.sol";

import {ImpactRiskAdjuster} from "./ImpactRiskAdjuster.sol";

/// @title ToraAquaPositionBuilder
/// @notice Builds Tora's Impact-Adjusted Concentrated Liquidity position for Aqua/SwapVM.
///
/// Position program:
///   [Deadline?]
///   -> [Tora ImpactRiskAdjuster custom opcode 0xd0]
///   -> [official Decay]
///   -> [official FeeFlatIn]
///   -> [official XYCConcentrateSwap]
///   -> [official Salt]
///
/// This combines:
//  - project risk/impact-aware virtual pricing,
///  - concentrated liquidity,
///  - time-decaying anti-reversal inventory pressure,
///  - LP fee,
///  - strategy expiry and unique position identity.
contract ToraAquaPositionBuilder {
    struct PositionConfig {
        uint256 sqrtPriceMin;
        uint256 sqrtPriceMax;
        uint16 decayPeriod;
        uint24 lpFeeBps;
        uint16 riskPremiumBps;
        uint16 impactDiscountBps;
        uint40 deadline;
        uint64 salt;
    }

    function buildProgram(PositionConfig calldata config)
        public
        pure
        returns (bytes memory)
    {
        return bytes.concat(
            config.deadline == 0 ? bytes("") : Deadline.build(config.deadline),
            ImpactRiskAdjuster.build(
                config.riskPremiumBps,
                config.impactDiscountBps
            ),
            Decay.build(config.decayPeriod),
            config.lpFeeBps == 0 ? bytes("") : FeeFlatIn.build(config.lpFeeBps),
            XYCConcentrateSwap.build(config.sqrtPriceMin, config.sqrtPriceMax),
            Salt.build(config.salt)
        );
    }

    function buildOrder(
        address maker,
        address token0,
        address token1,
        PositionConfig calldata config
    ) external pure returns (ISwapVM.Order memory order) {
        (address tokenA, address tokenB) =
            token0 < token1 ? (token0, token1) : (token1, token0);

        order = MakerTraitsLib.build(
            MakerTraitsLib.Args({
                maker: maker,
                receiver: address(0),
                tokenA: tokenA,
                tokenB: tokenB,
                shouldUnwrapWeth: false,
                useAquaInsteadOfSignature: true,
                allowZeroAmountIn: false,
                usePermit2: false,
                hasPreTransferInHook: false,
                hasPostTransferInHook: false,
                hasPreTransferOutHook: false,
                hasPostTransferOutHook: false,
                preTransferInTarget: address(0),
                preTransferInData: "",
                postTransferInTarget: address(0),
                postTransferInData: "",
                preTransferOutTarget: address(0),
                preTransferOutData: "",
                postTransferOutTarget: address(0),
                postTransferOutData: "",
                program: buildProgram(config)
            })
        );
    }

    function buildTakerData(
        address taker,
        bool isExactIn,
        bool isAToB,
        uint256 threshold,
        uint40 deadline
    ) external pure returns (bytes memory) {
        return TakerTraitsLib.build(
            TakerTraitsLib.Args({
                taker: taker,
                isExactIn: isExactIn,
                shouldUnwrapWeth: false,
                isStrictThresholdAmount: false,
                isFirstTransferFromTaker: true,
                useTransferFromAndAquaPush: true,
                isAToB: isAToB,
                allowPartialFill: false,
                usePermit2: false,
                threshold: threshold == 0 ? bytes("") : abi.encode(threshold),
                to: address(0),
                deadline: deadline,
                hasPreTransferInCallback: false,
                hasPreTransferOutCallback: false,
                preTransferInHookData: "",
                postTransferInHookData: "",
                preTransferOutHookData: "",
                postTransferOutHookData: "",
                preTransferInCallbackData: "",
                preTransferOutCallbackData: "",
                instructionsArgs: "",
                signature: ""
            })
        );
    }
}
