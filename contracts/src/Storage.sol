// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract Storage {
    uint256 private value;

    function set(uint256 next) external { value = next; }
    function get() external view returns (uint256) { return value; }
}
