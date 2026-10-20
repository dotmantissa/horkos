// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import {HorkosRegistry} from "./HorkosRegistry.sol";
import {OathVault} from "./OathVault.sol";
import {IERC20} from "./IFeeHook.sol";

/// @notice Read-only aggregation for public RPCs. Has no permissions or storage writes.
contract HorkosLens {
    struct Snapshot {
        address token; address creator; address vault; address feeRecipient;
        uint8 status; uint8 mode; uint64 start; uint64 cliff; uint64 end;
        uint16 burnBps; uint256 released; uint256 burned; uint256 totalReceived;
        uint256 claimable; uint64 nextUnlock; uint256 locked;
    }
    function snapshot(HorkosRegistry registry, uint256 id) external view returns (Snapshot memory s) {
        (s.token, s.creator, s.vault,) = registry.oaths(id);
        require(s.vault != address(0), "Unknown oath");
        OathVault v = OathVault(s.vault);
        s.feeRecipient = registry.hook().feeRecipient(s.token);
        s.status = uint8(registry.status(id)); s.mode = uint8(v.mode());
        s.start = v.start(); s.cliff = v.cliff(); s.end = v.end(); s.burnBps = v.burnBps();
        s.released = v.released(); s.burned = v.burned(); s.totalReceived = v.totalReceived();
        s.claimable = v.claimable(); s.nextUnlock = v.nextUnlock(); s.locked = IERC20(s.token).balanceOf(s.vault);
    }
}
