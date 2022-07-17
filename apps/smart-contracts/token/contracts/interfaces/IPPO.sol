// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./ITransferHook.sol";

//TODO: add all natspecs at the end
interface IPPO {
  function setTransferHook(ITransferHook newTransferHook) external;

  function mint(uint256 amount) external;

  function burn(uint256 amount) external;

  function burnFrom(address account, uint256 amount) external;

  function getTransferHook() external view returns (ITransferHook);
}
