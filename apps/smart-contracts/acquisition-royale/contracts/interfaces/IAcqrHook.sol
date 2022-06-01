// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

interface IAcqrHook {
  /**
   * A hook containing core RP calculation logic for mergers. Called after
   * the action has been paid for and an enterprise has been burnt. The
   * AcquisitionRoyale contract will update the caller's and target's
   * enterprise balances with the values returned by this hook.
   * @dev Any additional functionality should be included in this hook along
   * with the base merger logic.
   * Only the AcquisitionRoyale contract may call this hook.
   */
  function mergeHook(
    uint256 callerId,
    uint256 targetId,
    uint256 burnedId
  ) external returns (uint256 newCallerRpBalance, uint256 newTargetRpBalance);

  /**
   * A hook containing core RP calculation logic for competes. Called after
   * damage to be dealt is calculated based on the amount of RP provided.
   * The AcquisitionRoyale contract will update the caller's and target's
   * enterprise balances with the values returned by this hook.
   * @dev Any additional functionality should be included in this hook along
   * with the base compete logic.
   * Only the AcquisitionRoyale contract may call this hook.
   */
  function competeHook(
    uint256 callerId,
    uint256 targetId,
    uint256 damage,
    uint256 rpToSpend
  ) external returns (uint256 newCallerRpBalance, uint256 newTargetRpBalance);

  /**
   * A hook containing core RP calculation logic for acquisitions. Called
   * after the action has been paid for and enterprises have been
   * transferred/burnt. The AcquisitionRoyale contract will update the
   * caller's and target's enterprise balances with the values returned by
   * this hook.
   * @dev Any additional functionality should be included in this hook along
   * with the base acquisition logic.
   * Only the AcquisitionRoyale contract may call this hook.
   */
  function acquireHook(
    uint256 callerId,
    uint256 targetId,
    uint256 burnedId,
    uint256 nativeSent
  ) external returns (uint256 newCallerRpBalance, uint256 newTargetRpBalance);

  /**
   * A hook containing core RP calculation logic for deposits. Called
   * after the enterprise's balance has been updated with any RP accumulated
   * passively. The AcquisitionRoyale contract will update the enterprise's
   * balance with the value returned by this hook.
   * @dev Any additional functionality should be included in this hook along
   * with the base deposit logic.
   * Only the AcquisitionRoyale contract may call this hook.
   */
  function depositHook(uint256 enterpriseId, uint256 amount) external returns (uint256);

  /**
   * A hook containing core RP calculation logic for withdrawals. Called
   * after the enterprise's balance has been updated with any RP accumulated
   * passively. The AcquisitionRoyale contract will update the enterprise's
   * balance with the value returned by this hook.
   * @dev Any additional functionality should be included in this hook along
   * with the base withdrawal logic.
   * Only the AcquisitionRoyale contract may call this hook.
   */
  function withdrawHook(uint256 enterpriseId, uint256 amount)
    external
    returns (
      uint256 newCallerRpBalance,
      uint256 rpToMint,
      uint256 rpToBurn
    );
}
