// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

// TODO: add natspec comments
interface ISafeOwnable {
  event NomineeUpdate(address indexed previousNominee, address indexed newNominee);

  function transferOwnership(address account) external;

  function acceptOwnership() external;

  function getNominee() external view returns (address);
}
