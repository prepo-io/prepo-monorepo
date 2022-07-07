// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

/**
 * @notice Manages IOUPPO claiming and conversion into PPO.
 */
interface IIOUPPO {
  /// @dev Emitted via `setPause()`
  /// @param newPaused Whether claiming and converting is paused
  event PausedChanged(bool newPaused);

  /**
   * @notice Sets the address for PPO Token contract.
   * @dev Only callable by `owner()`.
   * @param newPPOToken Address of the PPO Token contract
   */
  function setPPOToken(address newPPOToken) external;

  /**
   * @notice Sets the address for PPO Staking contract.
   * @dev Only callable by `owner()`.
   * @param newPPOStaking Address of the PPO Staking contract
   */
  function setPPOStaking(address newPPOStaking) external;

  /**
   * @notice Sets whether IOUPPO claiming/converting should be paused or not.
   * @dev Only callable by `owner()`.
   * @param newPaused Whether claiming and converting should be paused
   */
  function setPaused(bool newPaused) external;

  /**
   * @notice Sets the root of Merkle tree to verify claiming/converting.
   * @dev Only callable by `owner()`.
   * @param newRoot Root of the Merkle tree
   */
  function setMerkleTreeRoot(bytes32 newRoot) external;

  /**
   * @notice Mints the required amount of IOUPPO to claimer.
   * @param amount Address of the account claiming/converting
   * @param staked Whether the claimer had staked or not
   * @param proof The proof submitted by claimer to claim IOUPPO
   */
  function claim(
    uint256 amount,
    bool staked,
    bytes32[] memory proof
  ) external;

  /**
   * @notice Converts the caller's IOUPPO balance into PPO
   * (and optionally stakes).
   * @dev If a user staked during the token sale, the value of shouldStake
   * will be ignored.
   * @param shouldStake Whether user wants to stake converted PPO or not
   */
  function convert(bool shouldStake) external;

  /**
   * @notice Withdraws any ERC20 token from the contract.
   * @dev Only callable by `owner()`.
   * @param token Address of the ERC20 token to be withdrawn
   * @param amount The amount to be withdrawn
   */
  function withdrawERC20(address token, uint256 amount) external;

  /**
   * @return address of the PPO Token contract
   */
  function getPPOToken() external view returns (address);

  /**
   * @return address of the PPO Staking contract
   */
  function getPPOStaking() external view returns (address);

  /**
   * @return True if IOUPPO claiming/converting is paused,
   * false otherwise
   */
  function getPaused() external view returns (bool);

  /**
   * @return Root of the Merkle tree
   */
  function getMerkleTreeRoot() external view returns (bytes32);

  /**
   * @return True if account has claimed IOUPPO, false otherwise
   */
  function hasClaimed(address account) external view returns (bool);

  /**
   * @return True if account has staked IOUPPO, false otherwise
   */
  function hasStaked(address account) external view returns (bool);
}
