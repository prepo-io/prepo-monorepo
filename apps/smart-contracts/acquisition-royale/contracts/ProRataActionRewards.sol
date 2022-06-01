// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./interfaces/IProRataActionRewards.sol";
import "./interfaces/IActionHook.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

contract ProRataActionRewards is
  IProRataActionRewards,
  OwnableUpgradeable,
  ReentrancyGuardUpgradeable
{
  using SafeERC20Upgradeable for IERC20Upgradeable;

  uint256 private _periodLength;
  uint256 private _userActionLimitPerPeriod;
  uint256 private _rewardAmountPerPeriod;
  IERC20Upgradeable private _rewardToken;
  uint256 private _totalCurrActionCount;
  uint256 private _totalPrevActionCount;
  uint256 private _prevStartTime;
  uint256 private _currStartTime;
  mapping(uint256 => uint256) private _userPeriodHashToActionCount;
  IActionHook private _actionHook;

  function initialize() public initializer {
    OwnableUpgradeable.__Ownable_init();
  }

  function setPeriodLength(uint256 _newPeriodLength) external override onlyOwner {
    _periodLength = _newPeriodLength;
  }

  function setUserActionLimitPerPeriod(uint256 _newUserActionLimitPerPeriod)
    external
    override
    onlyOwner
  {
    _userActionLimitPerPeriod = _newUserActionLimitPerPeriod;
  }

  function setRewardAmountPerPeriod(uint256 _newRewardAmountPerPeriod) external override onlyOwner {
    _rewardAmountPerPeriod = _newRewardAmountPerPeriod;
  }

  function setRewardToken(address _newRewardToken) external override onlyOwner {
    _rewardToken = IERC20Upgradeable(_newRewardToken);
  }

  function setActionHook(address _newActionHook) external override onlyOwner {
    _actionHook = IActionHook(_newActionHook);
  }

  function action() external override nonReentrant {
    if (block.timestamp - _currStartTime > _periodLength) {
      _totalPrevActionCount = _totalCurrActionCount;
      _prevStartTime = _currStartTime;
      _totalCurrActionCount = 0;
      _currStartTime = block.timestamp;
    }
    if (address(_actionHook) != address(0)) {
      _actionHook.hook(msg.sender);
    }
    require(getCurrActionCount(tx.origin) < _userActionLimitPerPeriod, "Action limit exceeded");
    ++_userPeriodHashToActionCount[_getKey(tx.origin, _currStartTime)];
    ++_totalCurrActionCount;
  }

  function withdrawERC20(address _token, uint256 _amount) external override onlyOwner nonReentrant {
    IERC20Upgradeable(_token).safeTransfer(owner(), _amount);
  }

  function getPeriodLength() external view override returns (uint256) {
    return _periodLength;
  }

  function getUserActionLimitPerPeriod() external view override returns (uint256) {
    return _userActionLimitPerPeriod;
  }

  function getRewardAmountPerPeriod() external view override returns (uint256) {
    return _rewardAmountPerPeriod;
  }

  function getRewardToken() external view override returns (IERC20Upgradeable) {
    return _rewardToken;
  }

  function getTotalCurrActionCount() external view override returns (uint256) {
    if (block.timestamp - _currStartTime <= _periodLength) {
      return _totalCurrActionCount;
    }
    return 0;
  }

  function getTotalPrevActionCount() external view override returns (uint256) {
    if (block.timestamp - _currStartTime <= _periodLength) {
      return _totalPrevActionCount;
    } else if (block.timestamp - _currStartTime <= 2 * _periodLength) {
      return _totalCurrActionCount;
    }
    return 0;
  }

  function getActionHook() external view override returns (IActionHook) {
    return _actionHook;
  }

  function getCurrActionCount(address _user) public view override returns (uint256) {
    if (block.timestamp - _currStartTime <= _periodLength) {
      return _userPeriodHashToActionCount[_getKey(_user, _currStartTime)];
    }
    return 0;
  }

  function getPrevActionCount(address _user) public view override returns (uint256) {
    if (block.timestamp - _currStartTime <= _periodLength) {
      return _userPeriodHashToActionCount[_getKey(_user, _prevStartTime)];
    } else if (block.timestamp - _currStartTime <= 2 * _periodLength) {
      return _userPeriodHashToActionCount[_getKey(_user, _currStartTime)];
    }
    return 0;
  }

  /**
   * @dev The key for the `_userPeriodHashToActionCount` mapping of a user is defined
   * as the hash of the sender's address and start time of that chosen period.
   * This insures that action count for all the users for previous and current
   * period are stored at different places and are swapped easily
   * by only updating `_prevStartTime` with `_currStartTime`. Also update of current
   * action counts to zero is done automatically when we update `_currStartTime` to a new
   * `block.timestamp`.
   */
  function _getKey(address _user, uint256 _startTime) private pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(_user, _startTime)));
  }
}
