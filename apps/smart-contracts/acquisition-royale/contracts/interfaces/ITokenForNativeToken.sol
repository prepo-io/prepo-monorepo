// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/**
 * @notice Accepts a specific ERC20 token tokens in exchange for the chain's native MATIC, at a fixed price.
 */
interface ITokenForNativeToken {
  //TODO: add natspecs for event
  event TokenSold(address indexed seller, uint256 tokenAmount, uint256 nativeTokenAmount);

  /**
   * TODO: add natspecs
   * TODO: add dev comment about tx.origin
   */
  function sell(uint256 tokenAmount) external returns (uint256);

  /**
   * @notice Withdraws native tokens from the contract to the owner.
   * @dev Only callable by `owner()`.
   * @param amount The amount of native token to be withdrawn
   */
  function withdrawNativeToken(uint256 amount) external;

  /**
   * @notice Withdraws any ERC20 token from the contract.
   * @dev Only callable by `owner()`.
   * @param token Address of the ERC20 token to be withdrawn
   * @param amount The amount to be withdrawn
   */
  function withdrawERC20(address token, uint256 amount) external;

  /**
   * @notice Sets the sellable token.
   * @dev Function can only be called by owner()
   * @param newToken Address of token contract
   */
  function setToken(address newToken) external;

  /**
   * @notice Sets the price of token.
   * @dev Function can only be called by owner()
   * @param newPricePerNativeToken Price of token for sale
   */
  function setPricePerNativeToken(uint256 newPricePerNativeToken) external;

  /**
   * @notice Sets the sellable limit of token for a user per period.
   * @dev Function can only be called by owner()
   * @param newUserSellableLimitPerPeriod Max amount of token a user can sell in a period
   */
  function setUserSellableLimitPerPeriod(uint256 newUserSellableLimitPerPeriod) external;

  /**
   * @notice Sets the global sellable limit of token per period.
   * @dev Function can only be called by owner()
   * @param newGlobalSellableLimitPerPeriod Max amount of token sellable in a period
   */
  function setGlobalSellableLimitPerPeriod(uint256 newGlobalSellableLimitPerPeriod) external;

  /**
   * @notice Sets the period of token sellable duration per limit.
   * @dev Function can only be called by owner()
   * @param newPeriodLength Period of token sellable duration per limit
   */
  function setPeriodLength(uint256 newPeriodLength) external;

  /**
   * @return Address of the sellable token
   */
  function getToken() external view returns (IERC20Upgradeable);

  /**
   * @return Price of the sellable token
   */
  function getPricePerNativeToken() external view returns (uint256);

  /**
   * @return Per-user limit on token sales for a period
   */
  function getUserSellableLimitPerPeriod() external view returns (uint256);

  /**
   * @return Global limit on token sales for a period
   */
  function getGlobalSellableLimitPerPeriod() external view returns (uint256);

  /**
   * @return Duration of time a token selling period lasts
   */
  function getPeriodLength() external view returns (uint256);

  /**
   * @param user Address of user
   * @return Amount of tokens a user sold in period
   * TODO: add note for tx.origin vs msg.sender
   */
  function getUserToTokenAmountThisPeriod(address user) external view returns (uint256);

  //TODO: add natspecs
  function getTotalTokenAmountThisPeriod() external view returns (uint256);
}
