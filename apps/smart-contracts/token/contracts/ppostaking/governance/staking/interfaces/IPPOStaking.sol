// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.6;
pragma abicoder v2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ILockedERC20} from "./ILockedERC20.sol";
import {ICalculatorFromTimestamp} from "./ICalculatorFromTimestamp.sol";
import "../deps/PPOGamifiedTokenStructs.sol";

/**
 * @notice PPOStaking is a non-transferrable ERC20 token that allows users to
 * stake and withdraw, earning voting rights. A user's scaled balance, or
 * PPO Power, is determined by completing achievements and the length of time
 * they keep their PPO staked. While a user's staked position is unique to
 * themselves, they can choose to delegate their voting power to another account.
 *
 * PPOStaking is heavily influenced by mStable's StakedToken.sol, which in
 * turn uses the checkpointed voting system implemented in OpenZeppelin's
 * `ERC20Votes.sol`.
 **/
interface IPPOStaking is ILockedERC20 {
  /***************************************
                STRUCTS (STAKING)
   ***************************************/
  struct Balance {
    /**
     * Units of staking token that has been deposited and consequently
     * wrapped.
     */
    uint128 raw;
    /**
     * (block.timestamp - weightedTimestamp) represents the seconds a user
     * has had their full raw balance wrapped. If they deposit or withdraw,
     * the weightedTimestamp is dragged towards block.timestamp
     * proportionately.
     */
    uint64 weightedTimestamp;
    /// Multiplier awarded for staking for a long time
    uint64 timeMultiplier;
    /// Multiplier obtained from AchievementsManager
    int64 achievementsMultiplier;
    /// Time at which the relative cooldown began
    uint64 cooldownTimestamp;
    /// Units up for cooldown
    uint128 cooldownUnits;
  }

  /***************************************
                STRUCTS (VOTING)
   ***************************************/
  struct Checkpoint {
    // Block number when voting snapshot was taken
    uint32 fromBlock;
    // Voting balance at the time of snapshot
    uint224 votes;
  }

  /***************************************
                EVENTS (STAKING)
   ***************************************/
  /**
   * @dev Emitted via `stake()`.
   * @param user Whose position is being added to
   * @param amount Amount added to a staked position
   */
  event Staked(address indexed user, uint256 amount);

  /**
   * @dev Emitted via `withdraw()`.
   * @param user Whose position is being withdraw from
   * @param to Account the withdrawn PPO was sent to
   * @param amount Amount removed from a staked position
   */
  event Withdraw(address indexed user, address indexed to, uint256 amount);

  /**
   * @dev Emitted via `startCooldown()`.
   * @param user Whose position is being cooled down
   * @param amount Portion of the staked position that is being cooled down
   */
  event Cooldown(address indexed user, uint256 amount);

  /**
   * @dev Emitted via `endCooldown()`.
   * @param user Whose cooldown is being ended
   */
  event CooldownExited(address indexed user);

  /***************************************
                EVENTS (VOTING)
   ***************************************/
  // TODO: The FE doesn't need these functions for mocking
  event GovernanceHookChanged(address indexed hook);

  /**
   * @dev Emitted when an account changes their delegatee.
   * @param delegator Delegator
   * @param fromDelegatee Previous delegatee
   * @param toDelegatee New delegatee
   */
  event DelegateeChange(
    address indexed delegator,
    address indexed fromDelegatee,
    address indexed toDelegatee
  );

  /**
   * @dev Emitted when a token transfer or delegatee change results in changes
   * to an account's voting power.
   * @param delegatee Delegatee
   * @param previousBalance Previous voting power
   * @param newBalance New voting power
   */
  event DelegateeVotesChange(
    address indexed delegatee,
    uint256 previousBalance,
    uint256 newBalance
  );

  /***************************************
                ACTIONS (STAKING)
   ***************************************/
  /**
   * @notice Stakes an `amount` of PPO on behalf of a `recipient`. Creates or
   * adds to a staked position to increase a user's PPO power for voting and
   * rewards.
   * @dev Mints a WithdrawalRights NFT to the `recipient` if they are a
   * first-time staker. The `tokenId` of this NFT will be permanently
   * associated with the `recipient`.
   * @param recipient Recipient of staked position
   * @param amount PPO amount to stake
   */
  function stake(address recipient, uint256 amount) external;

  /**
   * @notice Withdraw PPO from an account's staked position. The withdrawer
   * must hold the WithdrawalNFT associated with the account being withdrawn
   * from. This is to ensure that even though the position itself is not
   * directly transferrable, its financial value can be indirectly
   * transferred (e.g. the NFT can be given to a lending protocol for later
   * liquidation if necessary).
   *
   * A withdrawer can wait for the cooldown period to elapse, or withdraw
   * immediately for a greater penalty. A base penalty is applied in both
   * cases depending on the length of time an account has staked their PPO.
   *
   * @dev `exitCooldown` is an option because an account might not want to
   * withdraw the entire amount they have cooled down. If this is set to true,
   * their cooled down balance will be set to 0 and any portion of it that
   * wasn't withdrawn will be returned to their raw balance. If false, the
   * leftover cooled down balance will still be withdrawable until the
   * unstaking window ends.
   * @param amount Units of raw token to withdraw
   * @param recipient Recipient of raw PPO
   * @param exitCooldown Whether to exit the cooldown period
   * @param immediate Whether to bypass cooldown and immediately withdraw
   **/
  function withdraw(
    uint256 amount,
    address recipient,
    bool exitCooldown,
    bool immediate
  ) external;

  /**
   * @notice Sets `units` of the sender's raw PPO balance aside to enter a
   * cooldown period, after which (and before the unstake window elapses) this
   * amount will be withdrawable.
   * @dev During a cooldown period, any balance under cooldown is taken away
   * from an account's raw balance (and therefore PPO Power).
   * @param units Units of stake to cooldown for
   **/
  function startCooldown(uint256 units) external;

  /**
   * @notice Ends the sender's existing cooldown and gives them back their
   * full PPO power. This can be used to signal that the user no longer wishes
   * to exit the system.
   * @dev Any existing balance under cooldown will be returned to the sender's
   * raw balance (and therefore PPO Power).
   **/
  function endCooldown() external;

  /**
   * @notice Callable by anyone to update an account's time-based balance
   * multiplier.
   * @dev Reverts if update doesn't result in a change
   */
  function reviewTimestamp(address account) external;

  /***************************************
                ACTIONS (VOTING)
   ***************************************/
  /**
   * @dev Delegate votes from the sender to `delegatee`.
   * If `delegatee` is zero, the sender delegates to themselves.
   * @param delegatee The voting power recipient
   */
  function delegate(address delegatee) external;

  /***************************************
                ADMIN (STAKING)
   ***************************************/
  // TODO: The FE doesn't need these functions for mocking

  /***************************************
                ADMIN (VOTING)
   ***************************************/
  // TODO: The FE doesn't need these functions for mocking

  /***************************************
                VIEW (STAKING)
   ***************************************/
  /**
   * @dev Refer to `Balance` struct for a breakdown of the different values
   * stored to calculate an account's PPO Power from their raw balance.
   * @param account Account to fetch raw balance data for
   * @return Raw balance data for `account`
   */
  function balanceData(address account) external view returns (Balance memory);

  /**
   * @param account Account to fetch PPO Power for
   * @return Scaled balance for `account`
   */
  function balanceOf(address account) external view override returns (uint256);

  /**
   * @param account Account to fetch raw and cooled down balance for
   * @return Raw balance for `account`
   * @return Portion of staked position that is being cooled down
   */
  function rawBalanceOf(address account) external view returns (uint256, uint256);

  /// @return PPO Token contract
  function getPPOToken() external view returns (IERC20);

  /// @return Length of cooldown period in seconds
  function getCooldownSeconds() external view returns (uint256);

  /**
   * @notice After an account's cooldown period has passed, the unstaking
   * window is the length of time an account will be allowed to withdraw their
   * funds before another cooldown period must be initiated to withdraw.
   * @return Length of unstaking window in seconds
   */
  function getUnstakeWindow() external view returns (uint256);

  /// @return Contract used to calculate non-immediate withdrawal penalty
  function getDelayedRedemptionFeeCalculator() external view returns (ICalculatorFromTimestamp);

  /// @return Contract used to calculate immediate withdrawal penalty
  function getImmediateRedemptionFeeCalculator() external view returns (ICalculatorFromTimestamp);

  /// @return WithdrawalRights NFT contract
  function getWithdrawalRights() external view returns (IERC721);

  /// @return WithdrawalRights `tokenId` permanently associated with `account`
  function getWithdrawalRightsForAccount(address account) external view returns (uint256);

  /***************************************
                VIEW (VOTING)
   ***************************************/
  /**
   * @dev The `Checkpoint` struct contains the recorded voting power for an
   * account at a certain block. Refer to OpenZeppelin's
   * `ERC20VotesUpgradeable.sol`.
   * @param account Account to query voting checkpoint for
   * @param pos Index of voting checkpoint to retrieve
   * @return The `pos`-th checkpoint for `account`
   */
  function checkpoints(address account, uint32 pos) external view returns (Checkpoint memory);

  /**
   * @param account Account to query voting checkpoint for
   * @return Number of checkpoints for `account`
   */
  function numCheckpoints(address account) external view returns (uint32);

  /**
   * @dev Get the address the `delegator` is currently delegating to.
   * Return the `delegator` account if not delegating to anyone.
   * @param delegator the account that is delegating the votes from
   * @return delegatee that is receiving the delegated votes
   */
  function delegates(address delegator) external view returns (address);

  /**
   * @param account Account to query votes for
   * @return The current votes balance for `account`
   */
  function getVotes(address account) external view returns (uint256);

  /**
   * @dev The `blockNumber` provided needs to have already been
   * mined.
   * @param account Account to query voting snapshot for
   * @param blockNumber Block to query voting snapshot for
   * @return The number of votes for `account` at the end of `blockNumber`
   */
  function getPastVotes(address account, uint256 blockNumber) external view returns (uint256);

  /**
   * @dev Returns the historical sum of all PPO Power balances for a given
   * `blockNumber`. The `blockNumber` provided needs to have already been
   * mined.
   * @param blockNumber Block to query supply snapshot for
   * @return The `totalSupply` at the end of `blockNumber`
   */
  function getPastTotalSupply(uint256 blockNumber) external view returns (uint256);

  /// @return The current total sum of all PPO Power balances
  function totalSupply() external view override returns (uint256);
}
