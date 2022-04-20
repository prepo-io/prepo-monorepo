// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import './IAcquisitionRoyale.sol';

interface IMoat {
  /**
   * This function is meant to the called by a hook at the beginning
   * and end of a in-game action. This is because an enterprise might
   * qualify for a Moat based on RP they have passively accumulated,
   * but then subsequently lose it as the result of the action. Returns
   * the enterprise's updated moat status.
   * @dev Only callable by the configured AcquistionRoyale hook.
   */
  function updateAndGetMoatStatus(uint256 enterpriseId, uint256 enterpriseRpBalance)
    external
    returns (bool);

  /**
   * Sets the address of the hook that will be allowed to call
   * `updateAndGetMoatStatus`.
   * @dev Only callable by owner().
   */
  function setAcqrHook(address newAcqrHook) external;

  /**
   * Sets the new threshold for an enterprise's balance to qualify for a
   * moat.
   * @dev Only callable by owner().
   * Changing the `moatThreshold` during the game to a higher value
   * will result in some enterprises falling below the threshold, but
   * their immunity countdown will not start until an action is performed.
   * An update needs to be called to recognize the loss of moat status
   * from the threshold change and start the countdown.
   */
  function setMoatThreshold(uint256 newMoatThreshold) external;

  /**
   * Sets the period of time in seconds that an enterprise cannot be
   * acquired after its balance falls below the threshold.
   * @dev Only callable by owner().
   */
  function setMoatImmunityPeriod(uint256 newMoatImmunityPeriod) external;

  /**
   * Returns whether an Enterprise has the protection of a Moat and cannot
   * be acquired.
   * @dev If this function is called outside of an in-game action and
   * `moatThreshold` is changed mid-game, it might inaccurately return false
   * because an enterprise might now fall below the new threshold, but the
   * countdown hasn't been set to begin its period of immunity. This will
   * never happen with an in-game action because the moat status will be
   * updated prior to calling this function.
   */
  function enterpriseHasMoat(uint256 enterpriseId) external view returns (bool);

  /**
   * Returns the AcquisitionRoyale contract that this contract will poll
   * enterprise balances from.
   */
  function getAcquisitionRoyale() external view returns (IAcquisitionRoyale);

  /**
   * Returns the contract implementing `IAcqrHook` that is allowed to update
   * enterprise moat statuses via `updateMoatStatus`.
   */
  function getAcqrHook() external view returns (address);

  /**
   * Returns the threshold for an enterprise's balance to qualify for a
   * moat.
   */
  function getMoatThreshold() external view returns (uint256);

  /**
   * Returns the period of time in seconds that an enterprise cannot be
   * acquired after its balance falls below the threshold.
   */
  function getMoatImmunityPeriod() external view returns (uint256);

  /**
   * Returns an enterprise's last recorded moat status. This is needed to
   * know if an enterprise had a moat prior to falling below the
   * threshold.
   */
  function getLastHadMoat(uint256 enterpriseId) external view returns (bool);

  /**
   * The timestamp when a moated enterprise last had its RP balance fall
   * from above to below the threshold. The enterprise has until this
   * timestamp + `moatImmunityPeriod` to bring their RP balance back above
   * the threshold to stop the countdown.
   * @dev A countdown of 0 indicates that the enterprise is not in the
   * process of losing their moat (or did not have one to begin with).
   */
  function getMoatCountdown(uint256 enterpriseId) external view returns (uint256);
}
