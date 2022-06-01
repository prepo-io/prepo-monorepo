// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "../interfaces/IBranding.sol";

contract MockRevertBranding is IBranding {
  string private _artist;

  constructor() {
    _artist = "";
  }

  function getArt(uint256 tokenId) external view override returns (string memory) {
    revert("This should revert!");
  }

  function getArtist() external view override returns (string memory) {
    return _artist;
  }
}
