// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";
import "./IBranding.sol";
import "./ICompete.sol";
import "./ICost.sol";
import "./IRunwayPoints.sol";
import "./IMerkleProofVerifier.sol";
import "./IERC1155Burnable.sol";
import "./IAcqrHook.sol";

/**
 * Interface for the AcquisitionRoyale NFT game.
 */
interface IAcquisitionRoyale is IERC721MetadataUpgradeable, IERC721EnumerableUpgradeable {
  struct Enterprise {
    string name;
    uint256 rp;
    uint256 lastRpUpdateTime;
    uint256 acquisitionImmunityStartTime;
    uint256 mergerImmunityStartTime;
    uint256 revivalImmunityStartTime;
    uint256 competes;
    uint256 acquisitions;
    uint256 mergers;
    IBranding branding;
    uint256 fundraiseRpTotal;
    uint256 fundraiseWethTotal;
    uint256 damageDealt;
    uint256 damageTaken;
    uint256 renames;
    uint256 rebrands;
    uint256 revives;
  }

  event GameStartTimeChanged(uint256 startTime);
  event FoundingPriceAndTimeChanged(
    uint256 startPrice,
    uint256 endPrice,
    uint256 startTime,
    uint256 endTime
  );
  event PassiveRpPerDayChanged(uint256 max, uint256 base, uint256 acquisitions, uint256 mergers);
  event ImmunityPeriodsChanged(uint256 acquisition, uint256 merger, uint256 revival);
  event MergerBurnPercentageChanged(uint256 percentage);
  event WithdrawalBurnPercentageChanged(uint256 percentage);
  event CompeteChanged(address compete);
  event CostContractsChanged(
    address acquireCost,
    address mergeCost,
    address acquireRpCost,
    address mergeRpCost,
    address acquireRpReward
  );
  event Compete(
    uint256 indexed callerId,
    uint256 indexed targetId,
    uint256 rpSpent,
    uint256 damage
  );
  event Acquisition(uint256 indexed callerId, uint256 indexed targetId, uint256 burnedId);
  event Merger(uint256 indexed callerId, uint256 indexed targetId, uint256 burnedId);
  event Fundraise(uint256 indexed enterpriseId, uint256 amount);
  event Deposit(uint256 indexed enterpriseId, uint256 amount);
  event Withdrawal(uint256 indexed enterpriseId, uint256 amountAfterFee, uint256 fee);
  event Rename(uint256 indexed enterpriseId, string name);
  event Rebrand(uint256 indexed enterpriseId, address branding);
  event Revival(uint256 indexed enterpriseId);
  event SupportForBrandingChanged(address branding, bool supported);
  event FallbackBrandingChanged(address branding);

  /** MINTING FUNCTIONS **/
  /**
   * Mints enterprises reserved for the treasury at no cost to it.
   * Can be called at any anytime, mints until supply of MAX_RESERVED + MAX_FREE is exhausted.
   * @dev The minting supply of this function was extended to include MAX_FREE after free claiming was deprecated.
   * function can only be called by owner().
   */
  function foundReserved(address recipient) external;

  /**
   * Mints enterprises for a cost determined by a 2-week falling price auction. Prices start at foundingStartPrice
   * and linearly fall to foundingEndPrice.
   * Can be called once founding has started and until founding period ends or supply of MAX_AUCTIONED is exhausted.
   */
  function foundAuctioned(uint256 quantity) external payable;

  /** IN-GAME ACTIONS **/
  /**
   * Reduces the RP of a target enterprise based on the amount of RP the caller spends. Calling enterprise loses its immmunity.
   * Cost to compete is RP spent from the caller's enterprise.
   */
  function compete(
    uint256 callerId,
    uint256 targetId,
    uint256 rpToSpend
  ) external;

  /**
   * Competes with enough RP to bring target RP balance to zero and acquires the target enterprise.
   * Compete/Acquire behavior is identical to the actions performed individually.
   */
  function competeAndAcquire(
    uint256 callerId,
    uint256 targetId,
    uint256 burnedId
  ) external payable;

  /**
   * Merges two caller-owned enterprises, specifying either enterprise to be burnt in the process.
   * Increases the merger count for the surviving enterprise by one. Surviving enterprise gains immunity.
   * Cost is denominated in native token and is determined by MergeCost.
   */
  function merge(
    uint256 callerId,
    uint256 targetId,
    uint256 burnedId
  ) external payable;

  /// Deposits RP from the senders wallet into a enterprise they own.
  function deposit(uint256 enterpriseId, uint256 amount) external;

  /// Withdraws RP from a enterprise they own into the sender's wallet.
  function withdraw(uint256 enterpriseId, uint256 amount) external;

  /**
   * Burn a rename token to change your enterprise name, must abide by the following rules:
   * name must be unique
   * max 20 characters
   * only letters or spaces
   * cannot start or end with a space
   * no consecutive spaces
   * @dev Owner can call this function to change an enterprise name without rename tokens.
   * Name verification is also ignored to allow governance to set inappropriate names blank.
   */
  function rename(uint256 enterpriseId, string memory name) external;

  /**
   * Burn a rebrand token to change your enterprise artwork
   * @dev Owner can call this function to rebrand their own enterprises without rebrand tokens.
   */
  function rebrand(uint256 enterpriseId, IBranding branding) external;

  /**
   * Burn a revive token to bring back a burnt enterprise under your ownership.
   * @dev Owner can call this function to revive an enterprise without revive tokens.
   */
  function revive(uint256 enterpriseId) external;

  /** SETTERS FOR GAME/MINTING RELATED VALUES **/
  /**
   * Sets the start time for the Acquisition Royale game.
   * Users are limited to using rebrand and rename until game has begun.
   * @dev function can only be called by owner(). New value must be greater than zero.
   */
  function setGameStartTime(uint256 startTime) external;

  /**
   * Sets the parameters to begin the founding period. Values provided cannot be zero.
   * Founding end price must be >= start price. Founding start time must be >= end time.
   * @dev function can only be called by owner().
   */
  function setFoundingPriceAndTime(
    uint256 newFoundingStartPrice,
    uint256 newFoundingEndPrice,
    uint256 newFoundingStartTime,
    uint256 newFoundingEndTime
  ) external;

  /**
   * Sets the parameters for how much rp enterprises will generate passively.
   * default 20 max rp/day, 1 base rp/day, 2 rp/day per acquisition, 1 rp/day per merger
   * @dev function can only be called by owner().
   */
  function setPassiveRpPerDay(
    uint256 newMaxRpPerDay,
    uint256 newBaseRpPerDay,
    uint256 newAcquisitionRpPerDay,
    uint256 newMergerRpPerDay
  ) external;

  /**
   * Sets the immunity periods for acquisitions, mergers, and revivals.
   * These periods will be added to their respective immunity start times and
   * compared against the current timestamp to determine if an Enterprise is immune.
   * @dev function can only be called by owner().
   */
  function setImmunityPeriods(
    uint256 acquisitionImmunityPeriod,
    uint256 mergerImmunityPeriod,
    uint256 revivalImmunityPeriod
  ) external;

  /**
   * Sets the percentage of the burned enterprise's RP to burn during a merger.
   * @dev function can only be called by owner().
   */
  function setMergerBurnPercentage(uint256 percentage) external;

  /**
   * Sets the percentage of the RP burned during a withdrawal from an enterprise.
   * Initialized to default value of 25%.
   * @dev function can only be called by owner().
   */
  function setWithdrawalBurnPercentage(uint256 percentage) external;

  /** SETTERS FOR GAME SPECIFIC COMPONENTS **/
  /**
   * Sets the contract implementing ICompete to determine the RP damage and cost of a Compete action.
   * @dev function can only be called by owner().
   */
  function setCompete(address newCompete) external;

  /**
   * Sets all contracts that implement the `ICost` interface, used for
   * determining the cost of in-game actions.
   * @dev function can only be called by owner().
   */
  function setCostContracts(
    address _newAcquireCost,
    address _newMergeCost,
    address _newAcquireRpCost,
    address _newMergeRpCost,
    address _newAcquireRpReward
  ) external;

  /**
   * Sets whether contract implementing IBranding is whitelisted for usage.
   * @dev function can only be called by owner().
   */
  function setSupportForBranding(address branding, bool support) external;

  /**
   * Sets the contract implementing our default enterprise artwork if a enterprise brand returns an empty string.
   * @dev function can only be called by owner().
   */
  function setFallbackBranding(address newFallbackBranding) external;

  /**
   * Sets the alternate account able to use foundReserved.
   * @dev function can only be called by owner().
   */
  function setAdmin(address newAdmin) external;

  /**
   * Sets whether to only allow RP for in-game actions, only MATIC, or
   * allow both to be used. 0 = both can be used (default); 1 = RP only;
   * 2 = MATIC only.
   * @dev function can only be called by owner().
   */
  function setFundingMode(uint8 mode) external;

  /**
   * Sets the contract implementing `IAcqrHook` containing functions that
   * are called during in-game actions `compete`, `merge`, and
   * `competeAndAcquire`.
   * @dev function can only be called by owner().
   */
  function setHook(address newHooks) external;

  /**
   * Returns any native token balances stuck on the contract to the owner()
   * @dev function can only be called by owner().
   */
  function reclaimFunds() external;

  /** GETTERS FOR GAME COMPONENTS **/
  /**
   * Returns contract implementing IRunwayPoints for the in-game RP currency.
   * @dev Not set by a setter function, initialized with the contract.
   */
  function getRunwayPoints() external view returns (IRunwayPoints);

  /// Returns the contract implementing ICompete to determine the RP damage and cost of a Compete action.
  function getCompete() external view returns (ICompete);

  /**
   * Returns the contracts that implement the `ICost` interface, used for
   * determining the cost of in-game actions.
   */
  function getCostContracts()
    external
    view
    returns (
      ICost acquireCost_,
      ICost mergeCost_,
      ICost acquireRpCost_,
      ICost mergeRpCost_,
      ICost acquireRpReward_
    );

  /// Returns true if name is taken, false if not.
  function isNameInUse(string memory name) external view returns (bool);

  /// Returns whether a contract is a whitelisted branding.
  function isBrandingSupported(IBranding branding) external view returns (bool);

  /**
   * Returns the contract implementing consumables to rename/rebrand/revive enterprises.
   * @dev Acquisition Royale assumes ERC1155 token id 0 => rename, 1 => rebrand, 2 => revive.
   */
  function getConsumables() external view returns (IERC1155Burnable);

  /// Returns the artist of the art selected for a enterprise.
  function getArtist(uint256 enterpriseId) external view returns (string memory);

  /// Returns the contract implementing our default enterprise artwork if a enterprise brand returns an empty string.
  function getFallbackBranding() external view returns (IBranding);

  /** GETTERS FOR GAME/MINTING RELATED VALUES **/
  /// Returns the number of enterprises reserved for the treasury that have been minted.
  function getReservedCount() external view returns (uint256);

  /// Returns the number of enterprises claimable by eligible addresses that have been minted.
  function getFreeCount() external view returns (uint256);

  /// Returns the number of enterprises purchasable through the falling price auction that have been minted.
  function getAuctionCount() external view returns (uint256);

  /// Returns the start time for the Acquisition Royale game.
  function getGameStartTime() external view returns (uint256);

  /// Returns the start price, end price, start timestamp, and end timestamp for the falling price auction.
  function getFoundingPriceAndTime()
    external
    view
    returns (
      uint256,
      uint256,
      uint256,
      uint256
    );

  /// Returns the maximum passive rp accumulation/day, base rp/day, rp per acquisition/day, rp per merger/day.
  function getPassiveRpPerDay()
    external
    view
    returns (
      uint256,
      uint256,
      uint256,
      uint256
    );

  /**
   * For each action, returns the immunity period given to an Enterprise for
   * performing that action.
   */
  function getImmunityPeriods()
    external
    view
    returns (
      uint256 acquisition,
      uint256 merger,
      uint256 revival
    );

  /// Returns the percentage of the burned enterprise's RP to burn during a merger.
  function getMergerBurnPercentage() external view returns (uint256);

  /// Returns the percentage of the RP burned during a withdrawal from an enterprise.
  function getWithdrawalBurnPercentage() external view returns (uint256);

  /// Returns the alternate account able to use foundReserved.
  function getAdmin() external view returns (address);

  /**
   * Returns whether to only allow RP for in-game actions, only MATIC, or
   * allow both to be used. 0 = Both can be used (default); 1 = RP Only;
   * 2 = MATIC only.
   */
  function getFundingMode() external view returns (uint8);

  /**
   * Gets the contract implementing `IAcqrHook` containing functions that
   * are called during in-game actions `compete`, `merge`, and
   * `competeAndAcquire`.
   */
  function getHook() external view returns (IAcqrHook);

  /**
   * Returns true if an enterprise has already been minted, even if it was
   * burnt. False if not.
   */
  function isMinted(uint256 tokenId) external view returns (bool);

  /** HELPER METHODS **/
  /// Returns true if eligible address has already minted a enterprise via foundFree(), false if not.
  function hasFoundedFree(address user) external view returns (bool);

  /// Returns attributes via the Enterprise struct for a specific enterprise.
  function getEnterprise(uint256 enterpriseId) external view returns (Enterprise memory);

  /**
   * Returns the current price for minting a enterprise via the falling price auction.
   * The price is a linear interpolation between start and end price, over the timespan between start and end time.
   * The price cannot be lower than the end price.
   */
  function getAuctionPrice() external view returns (uint256);

  /**
   * Determines whether a enterprise is immune based on its acquisitionImmunityStartTime, mergerImmmunityStartTime,
   * and their respective immunity periods. Compares the maximum of both values with the current timestamp.
   * Returns true if immune, false if not.
   */
  function isEnterpriseImmune(uint256 enterpriseId) external view returns (bool);

  /**
   * @notice Returns the RP of an Enterprise including amounts passively earned since the last performed action.
   * @dev Enterprises accumulate RP passively from a base amount + amount earned for acquisitions/mergers.
   * This RP is calculated lazily, meaning that amounts earned from passive income are not updated on-chain
   * until an Enterprise is involved in an action.
   */
  function getEnterpriseVirtualBalance(uint256 enterpriseId) external view returns (uint256);

  /** CONTRACT CONSTANTS **/
  /// Maximum supply of enterprises reserved for the treasury, set to 10000.
  function getMaxReserved() external pure returns (uint256);

  /// Maximum supply of enterprises claimable for free by eligible addresses, set to 5000.
  function getMaxFree() external pure returns (uint256);

  /// Maximum supply of enterprises purchasable through the falling price auction, set to 5000.
  function getMaxAuctioned() external pure returns (uint256);
}
