// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/ISafeOwnable.sol";

contract SafeOwnableUpgradeable is ISafeOwnable, OwnableUpgradeable {
  address private _nominee;

  modifier onlyNominee() {
    require(_msgSender() == _nominee, "SafeOwnable: sender must be nominee");
    _;
  }

  function initialize() public initializer {
    __Ownable_init_unchained();
  }

  function transferOwnership(address _account)
    public
    virtual
    override(ISafeOwnable, OwnableUpgradeable)
    onlyOwner
  {
    _setNominee(_account);
  }

  function acceptOwnership() public virtual override onlyNominee {
    _transferOwnership(_nominee);
    _setNominee(address(0));
  }

  function getNominee() public view virtual override returns (address) {
    return _nominee;
  }

  function _setNominee(address _newNominee) internal virtual {
    address _oldNominee = _nominee;
    _nominee = _newNominee;
    emit NomineeUpdate(_oldNominee, _newNominee);
  }
}
