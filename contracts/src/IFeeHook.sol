// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Integration boundary. A real Ascend adapter must implement these semantics.
interface IFeeHook {
    function creatorOf(address token) external view returns (address);
    function feeRecipient(address token) external view returns (address);
    function recipientRevision(address token) external view returns (uint256);
    function bindVault(address token, address vault) external;
}
