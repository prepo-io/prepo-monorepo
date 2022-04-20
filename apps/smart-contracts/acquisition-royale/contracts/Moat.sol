// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import './interfaces/IMoat.sol';
import './interfaces/IAcquisitionRoyale.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Moat is IMoat, Ownable {
  IAcquisitionRoyale private _acquisitionRoyale;
  address private _acqrHook;
  uint256 private _moatThreshold;
  uint256 private _moatImmunityPeriod;
  mapping(uint256 => bool) private _enterpriseToLastHadMoat;
  mapping(uint256 => uint256) private _enterpriseToMoatCountdown;

  constructor(
    address _newAcquisitionRoyale,
    uint256 _newMoatThreshold,
    uint256 _newMoatImmunityPeriod
  ) {
    _acquisitionRoyale = IAcquisitionRoyale(_newAcquisitionRoyale);
    _moatThreshold = _newMoatThreshold;
    _moatImmunityPeriod = _newMoatImmunityPeriod;
  }

  modifier onlyAcqrHook {
    require(msg.sender == _acqrHook, 'Caller is not the ACQR hook');
    _;
  }

  function updateAndGetMoatStatus(uint256 _enterpriseId, uint256 _enterpriseRpBalance)
    external
    override
    onlyAcqrHook
    returns (bool)
  {
    bool _enterpriseLastHadMoat = _enterpriseToLastHadMoat[_enterpriseId];
    uint256 _enterpriseMoatCountdown = _enterpriseToMoatCountdown[_enterpriseId];
    if (_enterpriseRpBalance >= _moatThreshold) {
      if (!_enterpriseLastHadMoat) {
        _enterpriseToLastHadMoat[_enterpriseId] = true;
      }
      if (_enterpriseMoatCountdown != 0) {
        /**
         * Reset the moat countdown if the enterprise has brought
         * itself back above the threshold.
         */
        _enterpriseToMoatCountdown[_enterpriseId] = 0;
      }
    } else if (
      _enterpriseMoatCountdown + _moatImmunityPeriod < block.timestamp &&
      _enterpriseMoatCountdown != 0
    ) {
      /**
       * If the countdown has started for losing a moat, reset the
       * countdown if the immunity period has passed and set the
       * enterprise's last recorded moat status to false.
       */
      _enterpriseToLastHadMoat[_enterpriseId] = false;
      _enterpriseToMoatCountdown[_enterpriseId] = 0;
    } else if (_enterpriseMoatCountdown == 0 && _enterpriseLastHadMoat) {
      /**
       * If the enterprise had a moat and it has reached this block,
       * that means it has just fallen below the moat threshold and
       * its countdown needs to be started.
       */
      _enterpriseToMoatCountdown[_enterpriseId] = block.timestamp;
    }
    return _enterpriseToLastHadMoat[_enterpriseId];
  }

  function setAcqrHook(address _newAcqrHook) external override onlyOwner {
    _acqrHook = _newAcqrHook;
  }

  function setMoatThreshold(uint256 _newMoatThreshold) external override onlyOwner {
    _moatThreshold = _newMoatThreshold;
  }

  function setMoatImmunityPeriod(uint256 _newMoatImmunityPeriod) external override onlyOwner {
    _moatImmunityPeriod = _newMoatImmunityPeriod;
  }

  function enterpriseHasMoat(uint256 _enterpriseId) external view override returns (bool) {
    uint256 _enterpriseMoatCountdown = _enterpriseToMoatCountdown[_enterpriseId];
    /**
     * An enterprise has moat status if its balance exceeds the threshold, or
     * if its countdown has started but not passed the immunity period.
     */
    if (_acquisitionRoyale.getEnterpriseVirtualBalance(_enterpriseId) < _moatThreshold) {
      if (_enterpriseMoatCountdown != 0) {
        return _enterpriseMoatCountdown + _moatImmunityPeriod > block.timestamp;
      }
      return false;
    }
    return true;
  }

  function getAcquisitionRoyale() external view override returns (IAcquisitionRoyale) {
    return _acquisitionRoyale;
  }

  function getAcqrHook() external view override returns (address) {
    return _acqrHook;
  }

  function getMoatThreshold() external view override returns (uint256) {
    return _moatThreshold;
  }

  function getMoatImmunityPeriod() external view override returns (uint256) {
    return _moatImmunityPeriod;
  }

  function getLastHadMoat(uint256 _enterpriseId) external view override returns (bool) {
    return _enterpriseToLastHadMoat[_enterpriseId];
  }

  function getMoatCountdown(uint256 _enterpriseId) external view override returns (uint256) {
    return _enterpriseToMoatCountdown[_enterpriseId];
  }
}
