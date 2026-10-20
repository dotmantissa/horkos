// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import {HorkosLens} from "../src/HorkosLens.sol";
import {HorkosRegistry} from "../src/HorkosRegistry.sol";
import {MockFeeHook} from "../src/MockFeeHook.sol";
import {TestCoin} from "../src/TestCoin.sol";
import {OathVault} from "../src/OathVault.sol";
interface LensVm { function expectRevert(bytes calldata reason) external; }
contract LensTest {
    TestCoin coin; MockFeeHook hook; HorkosRegistry registry; HorkosLens lens;
    function setUp() public {
        coin = new TestCoin(); hook = new MockFeeHook(address(this)); registry = new HorkosRegistry(address(hook));
        hook.setRegistry(address(registry)); hook.registerToken(address(coin));
        registry.createOath(address(coin), OathVault.Mode.Burn, 100, 0, 5000); lens = new HorkosLens();
    }
    function testSnapshotMatchesSettlementState() public {
        (,,address vault,) = registry.oaths(1); coin.transfer(vault,100); OathVault(vault).settle();
        HorkosLens.Snapshot memory s = lens.snapshot(registry,1);
        require(s.token==address(coin) && s.vault==vault && s.creator==address(this),"Identity mismatch");
        require(s.mode==1 && s.status==0 && s.burnBps==5000,"Terms mismatch");
        require(s.totalReceived==100 && s.released==50 && s.burned==50 && s.locked==0 && s.claimable==0,"Accounting mismatch");
    }
    function testSnapshotReportsBreach() public { hook.setFeeRecipient(address(coin),address(this)); require(lens.snapshot(registry,1).status==2,"Missing breach"); }
    function testSnapshotRejectsUnknown() public {
        LensVm(address(uint160(uint256(keccak256("hevm cheat code"))))).expectRevert(bytes("Unknown oath")); lens.snapshot(registry,99);
    }
}
