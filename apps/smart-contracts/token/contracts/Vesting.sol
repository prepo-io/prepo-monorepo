// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IVesting.sol";
import "prepo-smart-contracts/contracts/SafeOwnable.sol";

contract Vesting is IVesting, SafeOwnable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  bool private _paused;
  IERC20 private _token;
  uint256 private _vestingStartTime;
  uint256 private _vestingEndTime;

  mapping(address => uint256) private _recipientToAllocatedAmount;
  mapping(address => uint256) private _recipientToClaimedAmount;

  uint256 private _totalAllocatedSupply;

  constructor(address _owner) {
    transferOwnership(_owner);
  }

  modifier whenNotPaused() {
    require(!_paused, "paused");
    _;
  }

  function setPaused(bool _newPaused) external override onlyOwner {
    _paused = _newPaused;
  }

  function setToken(address _newToken) external override onlyOwner {
    _token = IERC20(_newToken);
  }

  function setVestingStartTime(uint256 _newVestingStartTime) external override onlyOwner {
    require(_newVestingStartTime < _vestingEndTime, "Vesting start time >= end time");
    _vestingStartTime = _newVestingStartTime;
  }

  function setVestingEndTime(uint256 _newVestingEndTime) external override onlyOwner {
    require(_newVestingEndTime > _vestingStartTime, "Vesting end time <= start time");
    _vestingEndTime = _newVestingEndTime;
  }

  /**
   * @dev Ensure to separately calculate max array length that can be
   * passed in to `setAllocations()`, using stress test.
   */
  function setAllocations(address[] calldata _recipients, uint256[] calldata _amounts)
    external
    override
    onlyOwner
  {
    require(_recipients.length == _amounts.length, "Array length mismatch");
    uint256 _newTotalAllocatedSupply = _totalAllocatedSupply;
    for (uint256 i; i < _recipients.length; ++i) {
      uint256 _amount = _amounts[i];
      address _recipient = _recipients[i];
      uint256 _prevAllocatedAmount = _recipientToAllocatedAmount[_recipient];
      /**
       * If the new allocation amount is greater than _prevAllocatedAmount,
       * the absolute difference is added to
       * _newTotalAllocatedSupply, otherwise it is subtracted.
       */
      if (_amount > _prevAllocatedAmount) {
        _newTotalAllocatedSupply += _amount - _prevAllocatedAmount;
      } else {
        _newTotalAllocatedSupply -= _prevAllocatedAmount - _amount;
      }
      _recipientToAllocatedAmount[_recipient] = _amount;
      emit Allocation(_recipient, _amount);
    }

    _totalAllocatedSupply = _newTotalAllocatedSupply;
  }

  function claim() external override nonReentrant whenNotPaused {
    uint256 _claimableAmount = getClaimableAmount(msg.sender);
    require(_claimableAmount > 0, "Claimable amount = 0");
    require(
      _token.balanceOf(address(this)) >= _claimableAmount,
      "Insufficient balance in contract"
    );
    _recipientToClaimedAmount[msg.sender] += _claimableAmount;
    _token.transfer(msg.sender, _claimableAmount);
    emit Claimed(msg.sender, _claimableAmount);
  }

  function getClaimableAmount(address _recipient) public view override returns (uint256) {
    uint256 _vestedAmount = getVestedAmount(_recipient);
    uint256 _claimedTillNow = _recipientToClaimedAmount[_recipient];
    if (_vestedAmount > _claimedTillNow) {
      return (_vestedAmount - _claimedTillNow);
    } else {
      return 0;
    }
  }

  function getVestedAmount(address _recipient) public view override returns (uint256) {
    uint256 _start = _vestingStartTime;
    uint256 _end = _vestingEndTime;
    uint256 _allocated = _recipientToAllocatedAmount[_recipient];
    if (block.timestamp < _start) return 0;
    uint256 _vested = (_allocated * (block.timestamp - _start)) / (_end - _start);
    return _vested < _allocated ? _vested : _allocated;
  }

  function getPaused() external view override returns (bool) {
    return _paused;
  }

  function getToken() external view override returns (address) {
    return address(_token);
  }

  function getVestingStartTime() external view override returns (uint256) {
    return _vestingStartTime;
  }

  function getVestingEndTime() external view override returns (uint256) {
    return _vestingEndTime;
  }

  function getAmountAllocated(address _recipient) external view override returns (uint256) {
    return _recipientToAllocatedAmount[_recipient];
  }

  function getTotalAllocatedSupply() external view override returns (uint256) {
    return _totalAllocatedSupply;
  }

  function getClaimedAmount(address _recipient) external view override returns (uint256) {
    return _recipientToClaimedAmount[_recipient];
  }

  function withdrawERC20(address _erc20Token, uint256 _amount)
    external
    override
    onlyOwner
    nonReentrant
  {
    IERC20(_erc20Token).safeTransfer(owner(), _amount);
  }
}
