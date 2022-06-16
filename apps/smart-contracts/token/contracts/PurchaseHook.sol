// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./interfaces/IPurchaseHook.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PurchaseHook is IPurchaseHook, Ownable {
  mapping(address => uint256) private _erc721ToMaxPurchasesPerUser;
  mapping(address => mapping(uint256 => uint256)) private _erc1155ToIdToMaxPurchasesPerUser;

  function hookERC721(
    address _user,
    address _tokenContract,
    uint256 _tokenId
  ) external override {}

  function hookERC1155(
    address _user,
    address _tokenContract,
    uint256 _tokenId,
    uint256 _amount
  ) external override {}

  function setMaxERC721PurchasesPerUser(address[] memory _contracts, uint256[] memory _amounts)
    external
    override
    onlyOwner
  {
    require(_contracts.length == _amounts.length, "Array length mismatch");
    for (uint256 i; i < _contracts.length; ++i) {
      _erc721ToMaxPurchasesPerUser[_contracts[i]] = _amounts[i];
    }
  }

  function setMaxERC1155PurchasesPerUser(
    address[] memory _contracts,
    uint256[] memory _ids,
    uint256[] memory _amounts
  ) external override onlyOwner {
    require(
      _contracts.length == _amounts.length && _ids.length == _amounts.length,
      "Array length mismatch"
    );
    for (uint256 i; i < _contracts.length; ++i) {
      _erc1155ToIdToMaxPurchasesPerUser[_contracts[i]][_ids[i]] = _amounts[i];
    }
  }

  function getMaxERC721PurchasesPerUser(address _tokenContract)
    external
    view
    override
    returns (uint256)
  {
    return _erc721ToMaxPurchasesPerUser[_tokenContract];
  }

  function getMaxERC1155PurchasesPerUser(address _tokenContract, uint256 _id)
    external
    view
    override
    returns (uint256)
  {
    return _erc1155ToIdToMaxPurchasesPerUser[_tokenContract][_id];
  }
}
