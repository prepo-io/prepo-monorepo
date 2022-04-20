// UNLICENSED
pragma solidity =0.8.6;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract MockERC721 is ERC721, Ownable {
  constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

  function mint(address _recipient, uint256 _tokenId) external onlyOwner {
    _mint(_recipient, _tokenId);
  }
}
