// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./interfaces/IRestrictedTransferHook.sol";
import "./interfaces/IAccountList.sol";
import "./BlocklistTransferHook.sol";

contract RestrictedTransferHook is IRestrictedTransferHook, BlocklistTransferHook {
  IAccountList private _sourceAllowlist;
  IAccountList private _destinationAllowlist;

  constructor(address _nominatedOwner) BlocklistTransferHook(_nominatedOwner) {}

  function hook(
    address _from,
    address _to,
    uint256 _amount
  ) public virtual override(BlocklistTransferHook, ITransferHook) onlyToken {
    super.hook(_from, _to, _amount);
    if (_sourceAllowlist.isIncluded(_from)) return;
    require(_destinationAllowlist.isIncluded(_to), "Destination not allowed");
  }

  function setSourceAllowlist(IAccountList _newAllowedSources) external override onlyOwner {
    _sourceAllowlist = _newAllowedSources;
  }

  function setDestinationAllowlist(IAccountList _newDestinationAllowlist)
    external
    override
    onlyOwner
  {
    _destinationAllowlist = _newDestinationAllowlist;
  }

  function getSourceAllowlist() external view override returns (IAccountList) {
    return _sourceAllowlist;
  }

  function getDestinationAllowlist() external view override returns (IAccountList) {
    return _destinationAllowlist;
  }
}
