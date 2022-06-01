// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

interface IActionHook {
  /**
   * @notice To be called in `action()` in ProRataActionRewards contract.
   * @param user Address of the user
   */
  function hook(address user) external;
}
