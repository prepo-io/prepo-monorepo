// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import '../AcquisitionRoyale.sol';

contract MockAcquisitionRoyale is AcquisitionRoyale {
  uint256 _overrideSupply;

  function setReservedCount(uint256 _newReservedCount) external onlyOwner {
    _reservedCount = _newReservedCount;
  }

  function setFreeCount(uint256 _newFreeCount) external onlyOwner {
    _freeCount = _newFreeCount;
  }

  function setAuctionCount(uint256 _newAuctionCount) external onlyOwner {
    _auctionCount = _newAuctionCount;
  }

  function mintEnterprise(address _recipient, uint256 _enterpriseId) external onlyOwner {
    _safeMint(_recipient, _enterpriseId);
  }

  function burnEnterprise(uint256 _enterpriseId) external onlyOwner {
    _burn(_enterpriseId);
  }

  function setEnterpriseRp(uint256 _enterpriseId, uint256 _amount) external onlyOwner {
    _enterprises[_enterpriseId].rp = _amount;
  }

  function setEnterpriseStats(
    uint256 _enterpriseId,
    string memory _name,
    uint256 _rp,
    uint256 _competes,
    uint256 _acquisitions,
    uint256 _mergers,
    uint256 _fundraiseRpTotal,
    uint256 _fundraiseWethTotal,
    uint256 _damageDealt,
    uint256 _damageTaken,
    uint256 _rebrands,
    uint256 _revives
  ) external onlyOwner {
    _enterprises[_enterpriseId].name = _name;
    _enterprises[_enterpriseId].rp = _rp;
    _enterprises[_enterpriseId].competes = _competes;
    _enterprises[_enterpriseId].acquisitions = _acquisitions;
    _enterprises[_enterpriseId].mergers = _mergers;
    _enterprises[_enterpriseId].fundraiseRpTotal = _fundraiseRpTotal;
    _enterprises[_enterpriseId].fundraiseWethTotal = _fundraiseWethTotal;
    _enterprises[_enterpriseId].damageDealt = _damageDealt;
    _enterprises[_enterpriseId].damageTaken = _damageTaken;
    _enterprises[_enterpriseId].rebrands = _rebrands;
    _enterprises[_enterpriseId].revives = _revives;
  }

  function setEnterpriseLastRpUpdateTime(uint256 _enterpriseId, uint256 _timestamp)
    external
    onlyOwner
  {
    _enterprises[_enterpriseId].lastRpUpdateTime = _timestamp;
  }

  function setEnterpriseImmunityStartTime(
    uint256 _enterpriseId,
    uint256 _acquisitionStart,
    uint256 _mergerStart,
    uint256 _revivalStart
  ) external onlyOwner {
    _enterprises[_enterpriseId].acquisitionImmunityStartTime = _acquisitionStart;
    _enterprises[_enterpriseId].mergerImmunityStartTime = _mergerStart;
    _enterprises[_enterpriseId].revivalImmunityStartTime = _revivalStart;
  }

  function setOverrideSupply(uint256 _newSupply) external onlyOwner {
    _overrideSupply = _newSupply;
  }

  function isFundingNative(uint256 _nativeSent) external view returns (bool) {
    return _isFundingNative(_nativeSent);
  }

  function callMergeHook(
    uint256 _callerId,
    uint256 _targetId,
    uint256 _burnedId
  ) external returns (uint256 _newCallerRpBalance, uint256 _newTargetRpBalance) {
    return _hook.mergeHook(_callerId, _targetId, _burnedId);
  }

  function callCompeteHook(
    uint256 _callerId,
    uint256 _targetId,
    uint256 _damage,
    uint256 _rpToSpend
  ) external returns (uint256 _newCallerRpBalance, uint256 _newTargetRpBalance) {
    return _hook.competeHook(_callerId, _targetId, _damage, _rpToSpend);
  }

  function callAcquireHook(
    uint256 _callerId,
    uint256 _targetId,
    uint256 _burnedId,
    uint256 _nativeSent
  ) external returns (uint256 _newCallerRpBalance, uint256 _newTargetRpBalance) {
    return _hook.acquireHook(_callerId, _targetId, _burnedId, _nativeSent);
  }

  function callDepositHook(uint256 _enterpriseId, uint256 _amount) external returns (uint256) {
    return _hook.depositHook(_enterpriseId, _amount);
  }

  function callWithdrawHook(uint256 _enterpriseId, uint256 _amount)
    external
    returns (
      uint256 _newRpBalance,
      uint256 _rpToMint,
      uint256 _rpToBurn
    )
  {
    return _hook.withdrawHook(_enterpriseId, _amount);
  }

  function totalSupply() public view override returns (uint256) {
    return (_overrideSupply == 0) ? super.totalSupply() : _overrideSupply;
  }
}
