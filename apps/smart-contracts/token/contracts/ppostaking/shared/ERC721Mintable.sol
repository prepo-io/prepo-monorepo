// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721Mintable is ERC721, Ownable {
  constructor(string memory _newName, string memory _newSymbol) ERC721(_newName, _newSymbol) {}

  function mint(address _recipient, uint256 _tokenId) external onlyOwner {
    _mint(_recipient, _tokenId);
  }
}
