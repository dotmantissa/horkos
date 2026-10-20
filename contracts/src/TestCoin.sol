// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @notice MOCK fee asset; owner may mint demo balances. Never production money.
contract TestCoin {
    string public constant name = "Horkos Test Coin";
    string public constant symbol = "OATH";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public immutable owner;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() { owner = msg.sender; _mint(msg.sender, 1_000_000 ether); }
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Only minter"); _mint(to, amount);
    }
    function _mint(address to, uint256 amount) private {
        require(to != address(0), "Zero recipient");
        totalSupply += amount; balanceOf[to] += amount; emit Transfer(address(0), to, amount);
    }
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount; emit Approval(msg.sender, spender, amount); return true;
    }
    function transfer(address to, uint256 amount) external returns (bool) { _transfer(msg.sender, to, amount); return true; }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 permitted = allowance[from][msg.sender];
        if (permitted != type(uint256).max) allowance[from][msg.sender] = permitted - amount;
        _transfer(from, to, amount); return true;
    }
    function _transfer(address from, address to, uint256 amount) private {
        require(to != address(0), "Zero recipient");
        balanceOf[from] -= amount; balanceOf[to] += amount; emit Transfer(from, to, amount);
    }
}
