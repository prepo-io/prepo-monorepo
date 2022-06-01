// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

interface ICompete {
  function getDamage(
    uint256 callerId,
    uint256 recipientId,
    uint256 rpToSpend
  ) external returns (uint256);

  function getRpRequiredForDamage(
    uint256 callerId,
    uint256 recipientId,
    uint256 damage
  ) external view returns (uint256);
}
