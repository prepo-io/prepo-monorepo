// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./ITransferHook.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-IERC20PermitUpgradeable.sol";

//TODO: add all natspecs at the end
interface IPPO is IERC20Upgradeable, IERC20PermitUpgradeable {
  function setTransferHook(ITransferHook newTransferHook) external;

  function mint(address recipient, uint256 amount) external;

  function burn(uint256 amount) external;

  function burnFrom(address account, uint256 amount) external;

  function getTransferHook() external view returns (ITransferHook);
}
