// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

interface IBranding {
  function getArt(uint256 tokenId) external view returns (string memory);

  function getArtist() external view returns (string memory);
}
