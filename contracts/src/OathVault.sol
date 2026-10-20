// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import {IERC20} from "./IFeeHook.sol";

contract OathVault {
    enum Mode { Vest, Burn }
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    IERC20 public immutable token;
    address public immutable creator;
    Mode public immutable mode;
    uint64 public immutable start;
    uint64 public immutable cliff;
    uint64 public immutable end;
    uint16 public immutable burnBps;
    uint256 public released;
    uint256 public burned;
    bool private entered;
    event Settled(address indexed caller, uint256 releasedNow, uint256 burnedNow, uint256 remaining);

    constructor(address asset, address beneficiary, Mode pledgeMode, uint64 duration, uint64 cliffDelay, uint16 percentage) {
        require(asset.code.length > 0 && beneficiary != address(0), "Invalid vault");
        require(duration > 0 && duration <= 3650 days, "Invalid duration");
        if (pledgeMode == Mode.Vest) require(cliffDelay <= duration && percentage == 0, "Invalid vest terms");
        else require(cliffDelay == 0 && percentage > 0 && percentage <= 10_000, "Invalid burn terms");
        token = IERC20(asset); creator = beneficiary; mode = pledgeMode;
        start = uint64(block.timestamp); cliff = start + cliffDelay; end = start + duration; burnBps = percentage;
    }
    function totalReceived() public view returns (uint256) { return token.balanceOf(address(this)) + released + burned; }
    function vestedAmount() public view returns (uint256) {
        uint256 total = totalReceived();
        if (block.timestamp >= end) return total;
        if (block.timestamp <= cliff) return 0;
        return total * (block.timestamp - cliff) / (end - cliff);
    }
    function claimable() public view returns (uint256) {
        if (mode == Mode.Burn) return token.balanceOf(address(this));
        uint256 vested = vestedAmount(); return vested > released ? vested - released : 0;
    }
    function nextUnlock() external view returns (uint64) {
        if (mode == Mode.Burn || block.timestamp >= end) return 0;
        return block.timestamp <= cliff ? cliff + (cliff < end ? 1 : 0) : uint64(block.timestamp + 1);
    }
    function settle() external {
        require(!entered, "Reentrant settlement"); entered = true;
        uint256 toCreator; uint256 toBurn;
        if (mode == Mode.Vest) toCreator = claimable();
        else {
            uint256 balance = token.balanceOf(address(this));
            uint256 entitlement = totalReceived() * burnBps / 10_000;
            toBurn = entitlement - burned; toCreator = balance - toBurn;
        }
        released += toCreator; burned += toBurn;
        if (toBurn > 0) require(token.transfer(BURN_ADDRESS, toBurn), "Burn transfer failed");
        if (toCreator > 0) require(token.transfer(creator, toCreator), "Release transfer failed");
        emit Settled(msg.sender, toCreator, toBurn, token.balanceOf(address(this)));
        entered = false;
    }
}
