// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import {IFeeHook} from "./IFeeHook.sol";
import {OathVault} from "./OathVault.sol";

contract HorkosRegistry {
    enum Status { Active, Fulfilled, Breached }
    struct Oath { address token; address creator; address vault; uint256 revision; }
    IFeeHook public immutable hook;
    uint256 public oathCount;
    mapping(uint256 => Oath) public oaths;
    mapping(address => uint256) public oathForToken;
    event OathCreated(uint256 indexed oathId, address indexed token, address indexed creator, address vault, OathVault.Mode mode, uint64 duration, uint64 cliffDelay, uint16 burnBps);

    constructor(address feeHook) { require(feeHook.code.length > 0, "Invalid hook"); hook = IFeeHook(feeHook); }
    function createOath(address token, OathVault.Mode mode, uint64 duration, uint64 cliffDelay, uint16 burnBps) external returns (uint256 id) {
        require(hook.creatorOf(token) == msg.sender, "Only token creator");
        require(oathForToken[token] == 0, "Oath already exists");
        OathVault vault = new OathVault(token, msg.sender, mode, duration, cliffDelay, burnBps);
        id = ++oathCount; oathForToken[token] = id;
        hook.bindVault(token, address(vault));
        oaths[id] = Oath(token, msg.sender, address(vault), hook.recipientRevision(token));
        emit OathCreated(id, token, msg.sender, address(vault), mode, duration, cliffDelay, burnBps);
    }
    function status(uint256 id) external view returns (Status) {
        Oath memory oath = oaths[id]; require(oath.vault != address(0), "Unknown oath");
        if (hook.feeRecipient(oath.token) != oath.vault || hook.recipientRevision(oath.token) != oath.revision) return Status.Breached;
        OathVault vault = OathVault(oath.vault);
        if (block.timestamp >= vault.end() && vault.totalReceived() == vault.released() + vault.burned()) return Status.Fulfilled;
        return Status.Active;
    }
}
