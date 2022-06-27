// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

// TODO: add natspec comments
interface ISafeOwnable {
  event NomineeUpdate(address indexed previousNominee, address indexed newNominee);

  function getNominee() external view returns (address);
}
