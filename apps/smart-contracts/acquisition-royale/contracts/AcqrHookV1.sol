// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "./interfaces/IAcqrHook.sol";
import "./interfaces/IAcquisitionRoyale.sol";
import "./interfaces/IMoat.sol";

contract AcqrHookV1 is IAcqrHook {
  IAcquisitionRoyale private _acquisitionRoyale;
  IMoat private _moat;
  // percentages represented as 8 decimal place values.
  uint256 private constant PERCENT_DENOMINATOR = 10000000000;

  constructor(address _newAcquisitionRoyale, address _newMoat) {
    _acquisitionRoyale = IAcquisitionRoyale(_newAcquisitionRoyale);
    _moat = IMoat(_newMoat);
  }

  modifier onlyAcquisitionRoyale() {
    require(msg.sender == address(_acquisitionRoyale), "Caller is not Acquisition Royale");
    _;
  }

  function mergeHook(
    uint256 _callerId,
    uint256 _targetId,
    uint256 _burnedId
  )
    external
    override
    onlyAcquisitionRoyale
    returns (uint256 _newCallerRpBalance, uint256 _newTargetRpBalance)
  {
    uint256 _idToKeep = (_burnedId == _callerId) ? _targetId : _callerId;
    uint256 _rpBalanceOfKept = (_acquisitionRoyale.getEnterprise(_idToKeep)).rp;
    uint256 _rpBalanceOfBurnt = (_acquisitionRoyale.getEnterprise(_burnedId)).rp;
    /**
     * Check if passive RP accumulated has qualified the enterprise for
     * moat immunity.
     */
    _moat.updateAndGetMoatStatus(_idToKeep, _rpBalanceOfKept);
    _moat.updateAndGetMoatStatus(_burnedId, _rpBalanceOfBurnt);
    // round up to prevent amounts too small for precision costing zero
    uint256 _rpToBurn = ((_rpBalanceOfBurnt * _acquisitionRoyale.getMergerBurnPercentage()) /
      PERCENT_DENOMINATOR) + 1;
    if (_rpToBurn < _rpBalanceOfBurnt) {
      _rpBalanceOfKept += _rpBalanceOfBurnt - _rpToBurn;
    }
    if (_idToKeep == _callerId) {
      _newCallerRpBalance = _rpBalanceOfKept;
      _newTargetRpBalance = 0;
    } else {
      _newCallerRpBalance = 0;
      _newTargetRpBalance = _rpBalanceOfKept;
    }
    /**
     * Register the burnt enterprise's zeroed balance with the moat
     * contract and check to see if the kept enterprise qualifies for
     * moat immunity.
     */
    _moat.updateAndGetMoatStatus(_callerId, _newCallerRpBalance);
    _moat.updateAndGetMoatStatus(_targetId, _newTargetRpBalance);
  }

  function competeHook(
    uint256 _callerId,
    uint256 _targetId,
    uint256 _damage,
    uint256 _rpToSpend
  )
    external
    override
    onlyAcquisitionRoyale
    returns (uint256 _newCallerRpBalance, uint256 _newTargetRpBalance)
  {
    /**
     * If `rpToSpend` does more damage than the target's balance, only
     * subtract from the caller's balance the amount needed to bring the
     * target's balance to zero.
     */
    uint256 _currentCallerRpBalance = (_acquisitionRoyale.getEnterprise(_callerId)).rp;
    uint256 _currentTargetRpBalance = (_acquisitionRoyale.getEnterprise(_targetId)).rp;
    /**
     * Check if passive RP accumulated has qualified the enterprise for
     * moat immunity.
     */
    _moat.updateAndGetMoatStatus(_callerId, _currentCallerRpBalance);
    _moat.updateAndGetMoatStatus(_targetId, _currentTargetRpBalance);
    if (_damage > _currentTargetRpBalance) {
      // round up to prevent amounts too small for precision costing zero
      uint256 _percentForMaxDamage = (_currentTargetRpBalance * PERCENT_DENOMINATOR) / _damage + 1;
      _damage = _currentTargetRpBalance;
      _rpToSpend = (_percentForMaxDamage * _rpToSpend) / PERCENT_DENOMINATOR;
    }
    /**
     * No need to check if caller balance is sufficient since underflow
     * will revert.
     */
    _newCallerRpBalance = _currentCallerRpBalance - _rpToSpend;
    _newTargetRpBalance = _currentTargetRpBalance - _damage;
    /**
     * Check if the RP spent by the caller or damage taken by the target
     * brings their balances below the moat threshold.
     */
    _moat.updateAndGetMoatStatus(_callerId, _newCallerRpBalance);
    _moat.updateAndGetMoatStatus(_targetId, _newTargetRpBalance);
  }

  function acquireHook(
    uint256 _callerId,
    uint256 _targetId,
    uint256 _burnedId,
    uint256 _nativeSent
  )
    external
    override
    onlyAcquisitionRoyale
    returns (uint256 _newCallerRpBalance, uint256 _newTargetRpBalance)
  {
    /**
     * If the caller is being burned, transfers the caller's RP over to
     * the target enterprise. Burns an amount of the caller's RP before
     * transferring, based on `mergerBurnPercentage`. Rounded up to prevent
     * burning zero.
     */
    uint256 _currentCallerRpBalance = (_acquisitionRoyale.getEnterprise(_callerId)).rp;
    uint256 _currentTargetRpBalance = (_acquisitionRoyale.getEnterprise(_targetId)).rp;
    _newCallerRpBalance = _currentCallerRpBalance;
    _newTargetRpBalance = _currentTargetRpBalance;
    /**
     * Check if target has moat immunity before acquiring. An update is
     * unnecessary prior to the acquisition because both the calling and
     * target enterprise will have updated their moat status at the end
     * of the compete call.
     */
    require(!_moat.enterpriseHasMoat(_targetId), "Target has moat immunity");
    uint256 _idToKeep = (_burnedId == _callerId) ? _targetId : _callerId;
    if (_idToKeep == _targetId) {
      uint256 _rpToBurn = ((_currentCallerRpBalance *
        _acquisitionRoyale.getMergerBurnPercentage()) / PERCENT_DENOMINATOR) + 1;
      if (_rpToBurn < _currentCallerRpBalance) {
        _newTargetRpBalance += _currentCallerRpBalance - _rpToBurn;
        /**
         * Update the target's moat status with the new balance
         * reflecting the transferred RP from the caller.
         */
        _moat.updateAndGetMoatStatus(_targetId, _newTargetRpBalance);
      }
      _newCallerRpBalance = 0;
      /**
       * Moat contract only needs to update the calling enterprise's
       * status when it is the one being burnt.
       */
      _moat.updateAndGetMoatStatus(_callerId, 0);
    } else {
      _moat.updateAndGetMoatStatus(_targetId, 0);
    }
  }

  function depositHook(uint256 _enterpriseId, uint256 _amount)
    external
    override
    onlyAcquisitionRoyale
    returns (uint256)
  {
    uint256 _newRpBalance = (_acquisitionRoyale.getEnterprise(_enterpriseId)).rp + _amount;
    _moat.updateAndGetMoatStatus(_enterpriseId, _newRpBalance);
    return _newRpBalance;
  }

  function withdrawHook(uint256 _enterpriseId, uint256 _amount)
    external
    override
    onlyAcquisitionRoyale
    returns (
      uint256 _newRpBalance,
      uint256 _rpToMint,
      uint256 _rpToBurn
    )
  {
    uint256 _currentRpBalance = (_acquisitionRoyale.getEnterprise(_enterpriseId)).rp;
    _moat.updateAndGetMoatStatus(_enterpriseId, _currentRpBalance);
    _rpToBurn = (_amount * _acquisitionRoyale.getWithdrawalBurnPercentage()) / PERCENT_DENOMINATOR;
    _newRpBalance = _currentRpBalance - _amount;
    _moat.updateAndGetMoatStatus(_enterpriseId, _newRpBalance);
    _rpToMint = _amount - _rpToBurn;
  }

  function getAcquisitionRoyale() external view returns (IAcquisitionRoyale) {
    return _acquisitionRoyale;
  }

  function getMoat() external view returns (IMoat) {
    return _moat;
  }
}
