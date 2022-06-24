// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./ITokenShop.sol";

//TODO: Add natspecs at the end
interface IPurchaseHook {
  function hookERC721(
    address user,
    address tokenContract,
    uint256 tokenId
  ) external;

  function hookERC1155(
    address user,
    address tokenContract,
    uint256 tokenId,
    uint256 amount
  ) external;

  //TODO: move this into a sub-interface
  function setMaxERC721PurchasesPerUser(address[] memory contracts, uint256[] memory amounts)
    external;

  function setMaxERC1155PurchasesPerUser(
    address[] memory contracts,
    uint256[] memory ids,
    uint256[] memory amounts
  ) external;

  function setTokenShop(address newTokenShop) external;

  function getMaxERC721PurchasesPerUser(address tokenContract) external view returns (uint256);

  function getMaxERC1155PurchasesPerUser(address tokenContract, uint256 id)
    external
    view
    returns (uint256);

  function getTokenShop() external view returns (ITokenShop);
}
