// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IPPO.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "prepo-shared-contracts/contracts/SafeOwnableUpgradeable.sol";

contract PPO is IPPO, SafeOwnableUpgradeable, ERC20BurnableUpgradeable {
  ITransferHook private _transferHook;

  function initialize(
    string memory _name,
    string memory _symbol,
    address _nominatedOwner
  ) public initializer {
    __Ownable_init();
    __ERC20_init(_name, _symbol);
    transferOwnership(_nominatedOwner);
  }

  function setTransferHook(ITransferHook _newTransferHook) external override onlyOwner {
    _transferHook = _newTransferHook;
  }

  function mint(uint256 _amount) external override onlyOwner {}

  function burn(uint256 _amount) public override(IPPO, ERC20BurnableUpgradeable) onlyOwner {}

  function burnFrom(address _account, uint256 _amount)
    public
    override(IPPO, ERC20BurnableUpgradeable)
    onlyOwner
  {}

  function getTransferHook() external view override returns (ITransferHook) {
    return _transferHook;
  }
}
