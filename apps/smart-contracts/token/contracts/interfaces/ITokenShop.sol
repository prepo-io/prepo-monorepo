// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./IPurchaseHook.sol";

//TODO: add all natspecs at the end
interface ITokenShop {
  function setContractToIdToPrice(
    address[] memory tokenContracts,
    uint256[] memory ids,
    uint256[] memory prices
  ) external;

  function setPurchaseHook(address newPurchaseHook) external;

  //TODO: dev comment that ids can be left as 0 if it's an ERC721
  function purchase(
    address[] memory tokenContracts,
    uint256[] memory ids,
    uint256[] memory amounts
  ) external;

  function withdrawERC20(address erc20Token, uint256 amount) external;

  function withdrawERC721(address erc721Token, uint256 id) external;

  function withdrawERC1155(
    address erc1155Token,
    uint256 id,
    uint256 amount
  ) external;

  function getPrice(address tokenContract, uint256 id) external view returns (uint256);

  function getPaymentToken() external view returns (address);

  function getPurchaseHook() external view returns (IPurchaseHook);

  function getERC721PurchaseCount(address user, address tokenContract)
    external
    view
    returns (uint256);

  function getERC1155PurchaseCount(
    address user,
    address tokenContract,
    uint256 id
  ) external view returns (uint256);
}
