// UNLICENSED
pragma solidity =0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC1155 is ERC1155, Ownable {
  constructor(string memory uri_) ERC1155(uri_) {}

  function mint(
    address _recipient,
    uint256 _id,
    uint256 _amount
  ) external onlyOwner {
    _mint(_recipient, _id, _amount, "");
  }
}
