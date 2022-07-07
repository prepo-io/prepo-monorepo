// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "../PregenPass.sol";

contract MockPregenPass is PregenPass {
  constructor(address _owner, string memory _newURI) PregenPass(_owner, _newURI) {}

  function beforeTokenTransfer(
    address _from,
    address _to,
    uint256 _tokenId
  ) external {
    _beforeTokenTransfer(_from, _to, _tokenId);
  }
}
