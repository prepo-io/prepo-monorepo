// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "./IActionHook.sol";
import "./IAcquisitionRoyale.sol";

/**
 * Checks whether a user is eligible to call an action based on requirements
 * related to Acquisition Royale.
 */
interface IAcqRoyaleActionHook is IActionHook {
  /**
   * @dev Only callable by `owner()`.
   * @param newMinEnterpriseCount Minimum Enterprise count required to be eligible
   */
  function setMinEnterpriseCount(uint256 newMinEnterpriseCount) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newMinMergeCount Minimum merge count (for at least one Enterprise of a user)
   * required to be eligible
   */
  function setMinMergeCount(uint256 newMinMergeCount) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newMinAcquireCount Minimum acquire count (for at least one Enterprise of a user)
   * required to be eligible
   */
  function setMinAcquireCount(uint256 newMinAcquireCount) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newMinCompeteCount Minimum compete count (for at least one Enterprise of a user)
   * required to be eligible
   */
  function setMinCompeteCount(uint256 newMinCompeteCount) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newMinReviveCount Minimum revive count (for at least one Enterprise of a user)
   * required to be eligible
   */
  function setMinReviveCount(uint256 newMinReviveCount) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newMustBeRenamed Whether a user-owned Enterprise must be
   * renamed at least once for the user to be eligible
   */
  function setMustBeRenamed(bool newMustBeRenamed) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newMustBeRebranded Whether a user owned enterprise must be
   * rebranded at least once for the user to be eligible
   */
  function setMustBeRebranded(bool newMustBeRebranded) external;

  /**
   * @dev Only callable by `owner()`.
   * @param newAcqRoyale Address of the Acquisition Royale contract implementing `IAcquisitionRoyale`
   */
  function setAcqRoyale(address newAcqRoyale) external;

  /**
   * @return Minimum Enterprise count required to be eligible
   */
  function getMinEnterpriseCount() external returns (uint256);

  /**
   * @return Minimum merge count (for at least one Enterprise of a user)
   * required to be eligible
   */
  function getMinMergeCount() external returns (uint256);

  /**
   * @return Minimum acquire count (for at least one Enterprise of a user)
   * required to be eligible
   */
  function getMinAcquireCount() external returns (uint256);

  /**
   * @return Minimum compete count (for at least one Enterprise of a user)
   * required to be eligible
   */
  function getMinCompeteCount() external returns (uint256);

  /**
   * @return Minimum revive count (for at least one Enterprise of a user)
   * required to be eligible
   */
  function getMinReviveCount() external returns (uint256);

  /**
   * @return True if at least one user-owned Enterprise has been renamed at least once, false otherwise
   */
  function getMustBeRenamed() external returns (bool);

  /**
   * @return True if at least one user-owned Enterprise has been rebranded at least once, false otherwise
   */
  function getMustBeRebranded() external returns (bool);

  /**
   * @return Acquisition Royale contract implementing 'IAcquisitionRoyale'
   */
  function getAcqRoyale() external returns (IAcquisitionRoyale);
}
