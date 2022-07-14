// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract PregenPass is SafeOwnable, ERC721Enumerable {
  uint256 private _id;
  string private _uri;

  /**
   * @dev Owner will be set as the deployer. After deployment, the nominated owner needs to
   * accept the nomination for ownership to be transferred.
   */
  constructor(address _nominatedOwner, string memory _newURI) ERC721("Pregen Pass", "PREGENPASS") {
    transferOwnership(_nominatedOwner);
    _uri = _newURI;
  }

  function setURI(string memory _newURI) external onlyOwner {
    _uri = _newURI;
  }

  function mint(address _to) external {
    _safeMint(_to, _id++);
  }

  function mintBatch(address[] memory _accounts) external {
    uint256 _tempId = _id;
    uint256 _arrayLength = _accounts.length;
    for (uint256 i = 0; i < _arrayLength; ++i) {
      _safeMint(_accounts[i], _tempId++);
    }
    _id = _tempId;
  }

  function burn(uint256 _tokenId) external {
    _burn(_tokenId);
  }

  function burnBatch(uint256[] memory _tokenIds) external {
    uint256 _arrayLength = _tokenIds.length;
    for (uint256 i = 0; i < _arrayLength; ++i) {
      _burn(_tokenIds[i]);
    }
  }

  // solhint-disable-next-line no-unused-vars
  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    return _uri;
  }

  function _beforeTokenTransfer(
    address _from,
    address _to,
    uint256 _tokenId
  ) internal override(ERC721Enumerable) onlyOwner {
    super._beforeTokenTransfer(_from, _to, _tokenId);
  }
}
