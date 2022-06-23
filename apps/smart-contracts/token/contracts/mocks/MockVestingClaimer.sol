// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "../Vesting.sol";

contract MockVestingClaimer {
  Vesting private _vesting;

  constructor(address _newVesting) {
    _vesting = Vesting(_newVesting);
  }

  function claimFunds() external {
    _vesting.claim();
  }
}
