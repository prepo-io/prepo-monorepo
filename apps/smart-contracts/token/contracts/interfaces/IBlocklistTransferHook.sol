// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./ITransferHook.sol";
import "./IAccountList.sol";

//TODO: add all natspecs at the end
interface IBlocklistTransferHook is ITransferHook {
  function setBlocklist(IAccountList newBlocklist) external;

  function getBlocklist() external view returns (IAccountList);
}
