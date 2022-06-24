// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ISafeOwnable.sol";

contract SafeOwnable is ISafeOwnable, Ownable {
  address private _nominee;

  modifier onlyNominee() {
    require(_msgSender() == _nominee, "SafeOwnable: sender must be nominee");
    _;
  }

  function transferOwnership(address _account) public virtual override onlyOwner {
    _setNominee(_account);
  }

  function acceptOwnership() public virtual onlyNominee {
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
