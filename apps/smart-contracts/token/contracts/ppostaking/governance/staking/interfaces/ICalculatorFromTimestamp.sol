// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.6;

// TODO change compiler to 0.8.7

interface ICalculatorFromTimestamp {
  function calculate(uint256 timestamp) external view returns (uint256);
}
