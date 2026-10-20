// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import {TestCoin} from "../src/TestCoin.sol";
import {MockFeeHook} from "../src/MockFeeHook.sol";
import {OathVault} from "../src/OathVault.sol";
import {HorkosRegistry} from "../src/HorkosRegistry.sol";

interface Vm {
    function warp(uint256 time) external;
    function prank(address caller) external;
    function expectRevert() external;
    function expectRevert(bytes calldata reason) external;
}

contract HorkosTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    address private constant CREATOR = address(0xCAFE);
    address private constant PROTOCOL = address(0xBEEF);
    address private constant STRANGER = address(0x1234);
    TestCoin private coin;
    MockFeeHook private hook;
    HorkosRegistry private registry;

    function setUp() public {
        vm.warp(1000);
        coin = new TestCoin(); hook = new MockFeeHook(PROTOCOL); registry = new HorkosRegistry(address(hook));
        hook.setRegistry(address(registry)); vm.prank(CREATOR); hook.registerToken(address(coin));
    }
    function eq(uint256 a, uint256 b) private pure { require(a == b, "Values differ"); }
    function _vest(uint64 duration, uint64 cliff) private returns (OathVault vault) {
        vm.prank(CREATOR); uint256 id = registry.createOath(address(coin), OathVault.Mode.Vest, duration, cliff, 0);
        (,,address addr,) = registry.oaths(id); vault = OathVault(addr);
    }
    function _burn(uint16 bps) private returns (OathVault vault) {
        vm.prank(CREATOR); uint256 id = registry.createOath(address(coin), OathVault.Mode.Burn, 100, 0, bps);
        (,,address addr,) = registry.oaths(id); vault = OathVault(addr);
    }
    function testVestBeforeCliff() public { OathVault v = _vest(100,20); coin.transfer(address(v),1000); vm.warp(1019); v.settle(); eq(v.released(),0); }
    function testVestAtCliff() public { OathVault v = _vest(100,20); coin.transfer(address(v),1000); vm.warp(1020); eq(v.claimable(),0); eq(v.nextUnlock(),1021); }
    function testVestAfterCliff() public { OathVault v = _vest(100,20); coin.transfer(address(v),1000); vm.warp(1060); vm.prank(STRANGER); v.settle(); eq(v.released(),500); eq(coin.balanceOf(CREATOR),500); }
    function testVestAtEnd() public { OathVault v = _vest(100,20); coin.transfer(address(v),1000); vm.warp(1100); v.settle(); eq(v.released(),1000); eq(v.nextUnlock(),0); }
    function testVestAfterEnd() public { OathVault v = _vest(100,20); coin.transfer(address(v),1000); vm.warp(1200); v.settle(); eq(v.released(),1000); }
    function testCliffEqualsDuration() public { OathVault v = _vest(100,100); coin.transfer(address(v),1000); vm.warp(1099); eq(v.claimable(),0); vm.warp(1100); v.settle(); eq(v.released(),1000); }
    function testZeroCliffLinear() public { OathVault v = _vest(100,0); coin.transfer(address(v),1000); vm.warp(1050); v.settle(); eq(v.released(),500); }
    function testSettleTwiceDoesNotDoublePay() public { OathVault v = _vest(100,0); coin.transfer(address(v),1000); vm.warp(1050); v.settle(); v.settle(); eq(v.released(),500); eq(coin.balanceOf(address(v)),500); }
    function testLateDepositUsesOriginalSchedule() public { OathVault v = _vest(100,0); coin.transfer(address(v),1000); vm.warp(1050); v.settle(); coin.transfer(address(v),1000); v.settle(); eq(v.released(),1000); vm.warp(1100); v.settle(); eq(v.released(),2000); }
    function testPostEndDepositImmediatelyClaimable() public { OathVault v = _vest(100,0); vm.warp(1100); coin.transfer(address(v),42); eq(v.claimable(),42); v.settle(); eq(v.released(),42); }
    function testBurnSplit() public { OathVault v = _burn(2500); coin.transfer(address(v),1000); v.settle(); eq(v.burned(),250); eq(v.released(),750); eq(coin.balanceOf(v.BURN_ADDRESS()),250); }
    function testBurnCumulativeRounding() public { OathVault v = _burn(3333); coin.transfer(address(v),3); v.settle(); eq(v.burned(),0); coin.transfer(address(v),1); v.settle(); eq(v.burned(),1); eq(v.released(),3); }
    function testBurnTwice() public { OathVault v = _burn(5000); coin.transfer(address(v),100); v.settle(); v.settle(); eq(v.burned(),50); eq(v.released(),50); }
    function testBurnAll() public { OathVault v = _burn(10000); coin.transfer(address(v),7); v.settle(); eq(v.burned(),7); eq(v.released(),0); }
    function testBurnEmptySettlement() public { OathVault v = _burn(2500); v.settle(); eq(v.totalReceived(),0); }
    function testStatusRecipientChange() public { _vest(100,0); eq(uint256(registry.status(1)),0); vm.prank(CREATOR); hook.setFeeRecipient(address(coin),CREATOR); eq(uint256(registry.status(1)),2); }
    function testRestoringRecipientDoesNotEraseBreach() public { OathVault v = _vest(100,0); vm.prank(CREATOR); hook.setFeeRecipient(address(coin),CREATOR); vm.prank(CREATOR); hook.setFeeRecipient(address(coin),address(v)); eq(uint256(registry.status(1)),2); }
    function testNoOpRecipientDoesNotBreach() public { OathVault v = _vest(100,0); vm.prank(CREATOR); hook.setFeeRecipient(address(coin),address(v)); eq(uint256(registry.status(1)),0); }
    function testFulfilledRequiresSettlement() public { OathVault v = _vest(100,0); coin.transfer(address(v),100); vm.warp(1100); eq(uint256(registry.status(1)),0); v.settle(); eq(uint256(registry.status(1)),1); }
    function testBreachPrecedesFulfilled() public { _vest(100,0); vm.warp(1200); vm.prank(CREATOR); hook.setFeeRecipient(address(coin),CREATOR); eq(uint256(registry.status(1)),2); }
    function testBreachDoesNotUnlockFunds() public { OathVault v = _vest(100,20); coin.transfer(address(v),100); vm.prank(CREATOR); hook.setFeeRecipient(address(coin),CREATOR); v.settle(); eq(v.released(),0); vm.warp(1100); v.settle(); eq(v.released(),100); }
    function testOnlyCreatorCreatesOath() public { vm.expectRevert(bytes("Only token creator")); registry.createOath(address(coin),OathVault.Mode.Vest,100,0,0); }
    function testDuplicateOathRejected() public { _vest(100,0); vm.prank(CREATOR); vm.expectRevert(bytes("Oath already exists")); registry.createOath(address(coin),OathVault.Mode.Vest,100,0,0); }
    function testUnknownOathRejected() public { vm.expectRevert(bytes("Unknown oath")); registry.status(999); }
    function testOnlyCreatorChangesRecipient() public { vm.expectRevert(bytes("Only creator")); hook.setFeeRecipient(address(coin),STRANGER); }
    function testOnlyRegistryBindsVault() public { OathVault v = _vest(100,0); vm.expectRevert(bytes("Invalid binding")); hook.bindVault(address(coin),address(v)); }
    function testRegistryConfiguredOnce() public { vm.expectRevert(bytes("Invalid registry")); hook.setRegistry(address(registry)); }
    function testMockTradeFeeMath() public { OathVault v = _vest(100,0); coin.approve(address(hook),100 ether); hook.simulateTrade(address(coin),1000 ether); eq(coin.balanceOf(address(v)),2.5 ether); eq(coin.balanceOf(PROTOCOL),7.5 ether); }
    function testMockTradeInsufficientAllowance() public { _vest(100,0); vm.expectRevert(); hook.simulateTrade(address(coin),1000 ether); }
    function testMockTradeRejectsDust() public { _vest(100,0); vm.expectRevert(bytes("Fee rounds to zero")); hook.simulateTrade(address(coin),99); }
    function testInvalidTermsRejected() public {
        vm.prank(CREATOR); vm.expectRevert(bytes("Invalid duration")); registry.createOath(address(coin),OathVault.Mode.Vest,0,0,0);
        vm.prank(CREATOR); vm.expectRevert(bytes("Invalid vest terms")); registry.createOath(address(coin),OathVault.Mode.Vest,100,101,0);
        vm.prank(CREATOR); vm.expectRevert(bytes("Invalid burn terms")); registry.createOath(address(coin),OathVault.Mode.Burn,100,0,0);
    }
    function testOnlyOwnerMints() public { vm.prank(STRANGER); vm.expectRevert(bytes("Only minter")); coin.mint(STRANGER,100); }
    function testFuzzBurnRounding(uint64 amount, uint16 rawBps) public {
        uint16 bps = uint16(uint256(rawBps) % 10000 + 1); OathVault v = _burn(bps);
        coin.transfer(address(v),amount); v.settle(); eq(v.burned(),uint256(amount)*bps/10000); eq(v.released()+v.burned(),amount);
    }
    function testFuzzVestingConservation(uint64 amount, uint8 elapsed) public {
        OathVault v = _vest(100,20); coin.transfer(address(v),amount); uint256 t=uint256(elapsed)%101;
        vm.warp(1000+t); v.settle(); eq(v.released()+coin.balanceOf(address(v)),amount);
        vm.warp(1100); v.settle(); eq(v.released(),amount);
    }
}
