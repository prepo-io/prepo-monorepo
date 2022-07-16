// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IPPO.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "prepo-shared-contracts/contracts/SafeOwnableUpgradeable.sol";

contract PPO is IPPO, ReentrancyGuardUpgradeable, SafeOwnableUpgradeable, ERC20BurnableUpgradeable {
  ITransferHook private _transferHook;

  function initialize(
    address _nominatedOwner,
    string memory _name,
    string memory _symbol
  ) public initializer {
    __Ownable_init();
    __ERC20_init(_name, _symbol);
    __ReentrancyGuard_init_unchained();
    transferOwnership(_nominatedOwner);
  }

  function setTransferHook(ITransferHook _newTransferHook) external override onlyOwner {
    _transferHook = _newTransferHook;
  }

  function mint(uint256 _amount) external override onlyOwner {
    _mint(owner(), _amount);
  }

  function burn(uint256 _amount) public override(IPPO, ERC20BurnableUpgradeable) {
    super.burn(_amount);
  }

  function burnFrom(address _account, uint256 _amount)
    public
    override(IPPO, ERC20BurnableUpgradeable)
  {
    super.burnFrom(_account, _amount);
  }

  function getTransferHook() external view override returns (ITransferHook) {
    return _transferHook;
  }
}
