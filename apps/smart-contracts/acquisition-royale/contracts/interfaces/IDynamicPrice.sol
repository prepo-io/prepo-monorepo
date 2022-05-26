// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

interface IDynamicPrice {
  event CheckpointUpdated(uint256 time, uint256 price);
  event TimestepChanged(uint256 timestep);
  event IncreasePercentPerBumpChanged(uint256 percent);
  event ReductionPercentPerSecondChanged(uint256 percent);

  /**
   * Returns the latest checkpoint price, updates checkpoint if timestep seconds have passed
   * since the last checkpoint. Prices are influenced by time and the number of game
   * actions that have occurred since the last checkpoint.
   */
  function updatePrice(uint256 bumpCount) external returns (uint256);

  /**
   * @notice Sets the current checkpoint price to newCheckpointPrice and the checkpoint time to the
   * current time. Calling this function will start dynamic price calculations from this new
   * checkpoint.
   * @dev function can only be called by owner().
   */
  function resetCheckpoint(uint256 newCheckpointPrice) external;

  /**
   * @notice Sets the timestep used to determine when checkpoints are updated.
   * @dev function can only be called by owner().
   */
  function setTimestep(uint256 newTimestep) external;

  /**
   * @notice Sets the checkpoint % increase for each in-game action.
   * @dev factor to increase checkpoint by = (1 + increasePercentPerBump) ** bumps
   * unsigned 60.18-decimal fixed-point number
   * e.g. 7e15 is 0.007 (scaled by 1e18), 1.007^100 ~= 2x ~= 200% increase per 100 bumps
   * function can only be called by owner().
   */
  function setIncreasePercentPerBump(uint256 newIncreasePercentPerBump) external;

  /**
   * @notice Sets the checkpoint % decrease per second elapsed since last checkpoint. Cannot exceed 100% (1e18).
   * @dev factor to decrease checkpoint by = (1 + reductionPercentPerSecond) ** seconds elapsed
   * unsigned 60.18-decimal fixed-point number
   * e.g. 1.3e12 is 1-0.9999987 = 1.3e-6 (scaled by 1e18), 0.9999987^86400 ~= 0.893x ~= 10.7% decrease per day
   * function can only be called by owner().
   */
  function setReductionPercentPerSecond(uint256 newReductionPercentPerSecond) external;

  /// Returns the timestep used to determine when checkpoints are updated.
  function getTimestep() external view returns (uint256);

  /// Returns the timestamp of when the checkpoint was last updated.
  function getCheckpointTime() external view returns (uint256);

  /// Returns the price from the latest checkpoint.
  function getCheckpointPrice() external view returns (uint256);

  /// Returns the amount of in-game actions recorded since last checkpoint.
  function getBumpCountSinceCheckpoint() external view returns (uint256);

  /// Returns the percent to increase the checkpoint by for each in-game action.
  function getIncreasePercentPerBump() external view returns (uint256);

  /// Returns the percent to decrease the checkpoint per second elapsed since last checkpoint.
  function getReductionPercentPerSecond() external view returns (uint256);
}
