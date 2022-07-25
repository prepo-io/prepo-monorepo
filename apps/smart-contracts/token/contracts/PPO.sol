// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IPPO.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "prepo-shared-contracts/contracts/SafeOwnableUpgradeable.sol";

contract PPO is IPPO, SafeOwnableUpgradeable, ERC20BurnableUpgradeable, ERC20PermitUpgradeable {
  ITransferHook private _transferHook;

  function initialize(
    string memory _name,
    string memory _symbol,
    address _nominatedOwner
  ) public initializer {
    __Ownable_init();
    __ERC20_init(_name, _symbol);
    __ERC20Permit_init(_name);
    transferOwnership(_nominatedOwner);
  }

  function setTransferHook(ITransferHook _newTransferHook) external override onlyOwner {
    _transferHook = _newTransferHook;
  }

  function mint(address _recipient, uint256 _amount) external override onlyOwner {
    _mint(_recipient, _amount);
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

  function _beforeTokenTransfer(
    address _from,
    address _to,
    uint256 _amount
  ) internal override {
    require(address(_transferHook) != address(0), "Transfer hook not set");
    _transferHook.hook(_from, _to, _amount);
    super._beforeTokenTransfer(_from, _to, _amount);
  }
}
