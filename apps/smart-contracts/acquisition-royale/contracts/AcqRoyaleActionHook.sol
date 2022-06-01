// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAcqRoyaleActionHook.sol";
import "./interfaces/IAcquisitionRoyale.sol";

contract AcqRoyaleActionHook is IAcqRoyaleActionHook, Ownable {
  uint256 private _minEnterpriseCount;
  uint256 private _minMergeCount;
  uint256 private _minAcquireCount;
  uint256 private _minCompeteCount;
  uint256 private _minReviveCount;
  bool private _mustBeRenamed;
  bool private _mustBeRebranded;
  IAcquisitionRoyale private _acqRoyale;

  function setMinEnterpriseCount(uint256 _newMinEnterpriseCount) external override onlyOwner {
    _minEnterpriseCount = _newMinEnterpriseCount;
  }

  function setMinMergeCount(uint256 _newMinMergeCount) external override onlyOwner {
    _minMergeCount = _newMinMergeCount;
  }

  function setMinAcquireCount(uint256 _newMinAcquireCount) external override onlyOwner {
    _minAcquireCount = _newMinAcquireCount;
  }

  function setMinCompeteCount(uint256 _newMinCompeteCount) external override onlyOwner {
    _minCompeteCount = _newMinCompeteCount;
  }

  function setMinReviveCount(uint256 _newMinReviveCount) external override onlyOwner {
    _minReviveCount = _newMinReviveCount;
  }

  function setMustBeRenamed(bool _newMustBeRenamed) external override onlyOwner {
    _mustBeRenamed = _newMustBeRenamed;
  }

  function setMustBeRebranded(bool _newMustBeRebranded) external override onlyOwner {
    _mustBeRebranded = _newMustBeRebranded;
  }

  function setAcqRoyale(address _newAcqRoyale) external override onlyOwner {
    _acqRoyale = IAcquisitionRoyale(_newAcqRoyale);
  }

  function getMinEnterpriseCount() external view override returns (uint256) {
    return _minEnterpriseCount;
  }

  function getMinMergeCount() external view override returns (uint256) {
    return _minMergeCount;
  }

  function getMinAcquireCount() external view override returns (uint256) {
    return _minAcquireCount;
  }

  function getMinCompeteCount() external view override returns (uint256) {
    return _minCompeteCount;
  }

  function getMinReviveCount() external view override returns (uint256) {
    return _minReviveCount;
  }

  function getMustBeRenamed() external view override returns (bool) {
    return _mustBeRenamed;
  }

  function getMustBeRebranded() external view override returns (bool) {
    return _mustBeRebranded;
  }

  function getAcqRoyale() external view override returns (IAcquisitionRoyale) {
    return _acqRoyale;
  }

  function hook(address _user) external override {
    uint256 _userEnterpriseCount = _acqRoyale.balanceOf(_user);
    require(_userEnterpriseCount >= _minEnterpriseCount, "Enterprise count insufficient");
    for (uint256 i; i < _userEnterpriseCount; ++i) {
      IAcquisitionRoyale.Enterprise memory _ithEnterprise = _acqRoyale.getEnterprise(
        _acqRoyale.tokenOfOwnerByIndex(_user, i)
      );
      if (
        (_ithEnterprise.mergers < _minMergeCount) ||
        (_ithEnterprise.acquisitions < _minAcquireCount) ||
        (_ithEnterprise.competes < _minCompeteCount) ||
        (_ithEnterprise.revives < _minReviveCount) ||
        (_mustBeRebranded && (_ithEnterprise.rebrands == 0)) ||
        (_mustBeRenamed && (_ithEnterprise.renames == 0))
      ) {
        continue;
      }
      return;
    }
    revert("User not eligible");
  }
}
