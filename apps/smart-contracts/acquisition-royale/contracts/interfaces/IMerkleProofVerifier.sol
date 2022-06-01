// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

interface IMerkleProofVerifier {
  function verify(address account, bytes32[] memory proof) external view returns (bool);
}
