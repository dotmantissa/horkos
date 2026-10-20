// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import {IERC20, IFeeHook} from "./IFeeHook.sol";

/// @notice MOCK: charges fees only; does not swap assets or integrate Ascend.
contract MockFeeHook is IFeeHook {
    address public immutable owner;
    address public immutable protocolRecipient;
    address public registry;
    mapping(address => address) public creatorOf;
    mapping(address => address) public feeRecipient;
    mapping(address => uint256) public recipientRevision;
    event TokenRegistered(address indexed token, address indexed creator);
    event FeeRecipientChanged(address indexed token, address indexed recipient, uint256 revision);
    event MockTrade(address indexed token, address indexed trader, uint256 notional, uint256 fee, uint256 creatorFee);

    constructor(address protocol) {
        require(protocol != address(0), "Zero protocol"); owner = msg.sender; protocolRecipient = protocol;
    }
    function setRegistry(address next) external {
        require(msg.sender == owner && registry == address(0) && next.code.length > 0, "Invalid registry");
        registry = next;
    }
    function registerToken(address token) external {
        require(token.code.length > 0 && creatorOf[token] == address(0), "Invalid token");
        creatorOf[token] = msg.sender; feeRecipient[token] = msg.sender;
        emit TokenRegistered(token, msg.sender);
    }
    function bindVault(address token, address vault) external {
        require(msg.sender == registry && creatorOf[token] != address(0) && vault.code.length > 0, "Invalid binding");
        _setRecipient(token, vault);
    }
    function setFeeRecipient(address token, address recipient) external {
        require(msg.sender == creatorOf[token], "Only creator");
        require(recipient != address(0), "Zero recipient");
        _setRecipient(token, recipient);
    }
    function _setRecipient(address token, address recipient) private {
        if (feeRecipient[token] == recipient) return;
        feeRecipient[token] = recipient; uint256 revision = ++recipientRevision[token];
        emit FeeRecipientChanged(token, recipient, revision);
    }
    function simulateTrade(address token, uint256 notional) external {
        address recipient = feeRecipient[token]; require(recipient != address(0), "Unknown token");
        uint256 fee = notional / 100; require(fee > 0, "Fee rounds to zero");
        uint256 creatorFee = fee / 4;
        require(IERC20(token).transferFrom(msg.sender, recipient, creatorFee), "Creator fee failed");
        require(IERC20(token).transferFrom(msg.sender, protocolRecipient, fee - creatorFee), "Protocol fee failed");
        emit MockTrade(token, msg.sender, notional, fee, creatorFee);
    }
}
