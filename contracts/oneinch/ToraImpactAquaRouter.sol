// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {AquaSwapVMRouter} from "@1inch/swap-vm/contracts/routers/AquaSwapVMRouter.sol";
import {Context} from "@1inch/swap-vm/contracts/libs/VM.sol";

import {ImpactRiskAdjuster} from "./ImpactRiskAdjuster.sol";

/// @title ToraImpactAquaRouter
/// @notice Custom Aqua + SwapVM app for tokenised impact-asset secondary liquidity.
/// @dev Uses the official AquaSwapVMRouter and extends its opcode dispatcher with
///      Tora's custom 0xd0 impact/risk pricing instruction.
contract ToraImpactAquaRouter is AquaSwapVMRouter {
    uint256 public constant IMPACT_RISK_OPCODE = 0xd0;

    constructor(address aqua, address weth, address owner)
        AquaSwapVMRouter(aqua, weth, owner, "ToraImpactAquaRouter", "1")
    {}

    function _runOpcode(Context memory ctx, uint256 opcode, bytes calldata args)
        internal
        override
    {
        if (opcode == IMPACT_RISK_OPCODE) {
            ImpactRiskAdjuster.exec(ctx, args);
        } else {
            super._runOpcode(ctx, opcode, args);
        }
    }
}
