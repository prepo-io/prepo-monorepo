// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/ITokenForNativeToken.sol";

contract TokenForNativeToken is
  ITokenForNativeToken,
  OwnableUpgradeable,
  ReentrancyGuardUpgradeable
{
  using SafeERC20Upgradeable for IERC20Upgradeable;

  IERC20Upgradeable private _token;
  uint256 private _pricePerNativeToken;
  uint256 private _userSellableLimitPerPeriod;
  uint256 private _globalSellableLimitPerPeriod;
  uint256 private _periodLength;

  mapping(address => uint256) private _userToTokenAmountThisPeriod;
  mapping(address => uint256) private _userToLastPeriod;

  uint256 private _totalTokenAmountThisPeriod;
  uint256 private _lastPeriod;

  function initialize() public initializer {
    __Ownable_init();
  }

  function sell(uint256 _tokenAmount) external override nonReentrant returns (uint256) {
    _updateSellableAmount(tx.origin, _tokenAmount);
    _checkSellableLimit(tx.origin, _tokenAmount);
    _token.safeTransferFrom(tx.origin, owner(), _tokenAmount);
    uint256 _nativeTokenAmount = (_tokenAmount * _pricePerNativeToken) / 1e18;
    (bool _success, ) = tx.origin.call{value: _nativeTokenAmount}("");
    require(_success, "Native token transfer failed");
    emit TokenSold(tx.origin, _tokenAmount, _nativeTokenAmount);
    return _nativeTokenAmount;
  }

  function _updateSellableAmount(address _user, uint256 _tokenAmount) internal {
    uint256 _currentPeriod = block.timestamp / _periodLength;
    if (_currentPeriod > _lastPeriod) {
      _totalTokenAmountThisPeriod = 0;
      _lastPeriod = _currentPeriod;
    }
    if (_currentPeriod > _userToLastPeriod[_user]) {
      _userToTokenAmountThisPeriod[_user] = 0;
      _userToLastPeriod[_user] = _currentPeriod;
    }
    _userToTokenAmountThisPeriod[_user] += _tokenAmount;
    _totalTokenAmountThisPeriod += _tokenAmount;
  }

  function _checkSellableLimit(address _user, uint256 _tokenAmount) internal view returns (bool) {
    require(
      _totalTokenAmountThisPeriod <= _globalSellableLimitPerPeriod,
      "Global sellable limit exceeded"
    );
    require(
      _userToTokenAmountThisPeriod[_user] <= _userSellableLimitPerPeriod,
      "User sellable limit exceeded"
    );
  }

  function withdrawNativeToken(uint256 _amount) external override onlyOwner nonReentrant {
    (bool _success, ) = owner().call{value: _amount}("");
    require(_success, "Failed to withdraw");
  }

  function withdrawERC20(address _token, uint256 _amount) external override onlyOwner nonReentrant {
    IERC20Upgradeable(_token).safeTransfer(owner(), _amount);
  }

  function setToken(address _newToken) external override onlyOwner {
    _token = IERC20Upgradeable(_newToken);
  }

  function setPricePerNativeToken(uint256 _newPricePerNativeToken) external override onlyOwner {
    _pricePerNativeToken = _newPricePerNativeToken;
  }

  function setUserSellableLimitPerPeriod(uint256 _newUserSellableLimitPerPeriod)
    external
    override
    onlyOwner
  {
    _userSellableLimitPerPeriod = _newUserSellableLimitPerPeriod;
  }

  function setGlobalSellableLimitPerPeriod(uint256 _newGlobalSellableLimitPerPeriod)
    external
    override
    onlyOwner
  {
    _globalSellableLimitPerPeriod = _newGlobalSellableLimitPerPeriod;
  }

  function setPeriodLength(uint256 _newPeriodLength) external override onlyOwner {
    _periodLength = _newPeriodLength;
  }

  function getToken() external view override returns (IERC20Upgradeable) {
    return _token;
  }

  function getPricePerNativeToken() external view override returns (uint256) {
    return _pricePerNativeToken;
  }

  function getUserSellableLimitPerPeriod() external view override returns (uint256) {
    return _userSellableLimitPerPeriod;
  }

  function getGlobalSellableLimitPerPeriod() external view override returns (uint256) {
    return _globalSellableLimitPerPeriod;
  }

  function getPeriodLength() external view override returns (uint256) {
    return _periodLength;
  }

  function getUserToTokenAmountThisPeriod(address _user) external view override returns (uint256) {
    uint256 _currentPeriod = block.timestamp / _periodLength;
    if (_currentPeriod > _userToLastPeriod[_user]) {
      return 0;
    }
    return _userToTokenAmountThisPeriod[_user];
  }

  function getTotalTokenAmountThisPeriod() external view override returns (uint256) {
    uint256 _currentPeriod = block.timestamp / _periodLength;
    if (_currentPeriod > _lastPeriod) {
      return 0;
    }
    return _totalTokenAmountThisPeriod;
  }
}
