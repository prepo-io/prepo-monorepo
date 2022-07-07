// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Mintable is ERC1155, Ownable {
  constructor(string memory _newUri) ERC1155(_newUri) {}

  function mint(
    address _recipient,
    uint256 _id,
    uint256 _amount
  ) external onlyOwner {
    _mint(_recipient, _id, _amount, "");
  }
}
