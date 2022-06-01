// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./IActionHook.sol";

/**
 * @notice Splits the total token reward to players proportional
 * to their action count for each period length.
 */
interface IProRataActionRewards {
  /**
   * @dev Only callable by `owner()`.
   * @param newPeriodLength Period length in seconds
   */
  function setPeriodLength(uint256 newPeriodLength) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newUserActionLimitPerPeriod Max number of times a user can call `action()`
   */
  function setUserActionLimitPerPeriod(uint256 newUserActionLimitPerPeriod) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newRewardAmountPerPeriod Max token amount to be distributed every period
   */
  function setRewardAmountPerPeriod(uint256 newRewardAmountPerPeriod) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newRewardToken The address of the reward token
   */
  function setRewardToken(address newRewardToken) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newActionHook Address of the action hook contract called within `action()`
   */
  function setActionHook(address newActionHook) external;

  /**
     * @notice Increases the user's action count by 1 (up to the action limit).
     * @dev If a new period has begun since `action()` was last called,
     * the previous and current total action counts and current period
     * start time will be updated.
     *
     * An action hook will be called, which may be used to check a user's eligibility
     * to perform the action, or for other purposes.
     *
     * The action count is tracked per EOA (i.e. on a `tx.origin` basis, not `msg.sender`).

     */
  function action() external;

  /**
   * @notice Withdraws any ERC20 token from the contract.
   * @dev Only callable by `owner()`.
   * @param token Address of the ERC20 token to be withdrawn
   * @param amount The amount to be withdrawn
   */
  function withdrawERC20(address token, uint256 amount) external;

  /**
   * @return Period length in seconds
   */
  function getPeriodLength() external view returns (uint256);

  /**
   * @return Action limit per period for each user
   */
  function getUserActionLimitPerPeriod() external view returns (uint256);

  /**
   * @return Total reward amount per period
   */
  function getRewardAmountPerPeriod() external view returns (uint256);

  /**
   * @return Address of the reward token
   */
  function getRewardToken() external view returns (IERC20Upgradeable);

  /**
   * @return Action hook contract called within `action()`
   */
  function getActionHook() external view returns (IActionHook);

  /**
   * @return Sum of action count of all users for current period
   */
  function getTotalCurrActionCount() external view returns (uint256);

  /**
   * @return Sum of action count of all users for previous period
   */
  function getTotalPrevActionCount() external view returns (uint256);

  /**
   * @return Action count of given EOA for current period
   */
  function getCurrActionCount(address user) external view returns (uint256);

  /**
   * @return Action count of given EOA for previous period
   */
  function getPrevActionCount(address user) external view returns (uint256);
}
