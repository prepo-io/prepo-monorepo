// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "../interfaces/IBranding.sol";

contract MockBranding is IBranding {
  string private _artist;

  constructor() {
    _artist = "test artist";
  }

  function getArt(uint256 tokenId) external view override returns (string memory) {
    return "Test Art";
  }

  function getArtist() external view override returns (string memory) {
    return _artist;
  }
}
