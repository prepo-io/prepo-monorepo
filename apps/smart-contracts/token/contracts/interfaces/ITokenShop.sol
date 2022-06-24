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

  function setPaused(bool newPaused) external;

  function setPurchaseHook(address newPurchaseHook) external;

  function purchase(
    address[] memory tokenContracts,
    uint256[] memory ids,
    uint256[] memory amounts
  ) external;

  function getPrice(address tokenContract, uint256 id) external view returns (uint256);

  function isPaused() external view returns (bool);

  function getPaymentToken() external view returns (address);

  function getPurchaseHook() external view returns (IPurchaseHook);

  function getERC721PurchaseCount(address user, address tokenContract)
    external
    view
    returns (uint256);

  function withdrawERC20(address _erc20Token, uint256 _amount) external;
}
