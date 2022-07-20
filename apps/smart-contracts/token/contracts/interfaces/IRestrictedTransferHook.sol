// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./IBlocklistTransferHook.sol";
import "./IAccountList.sol";

//TODO: add all natspecs at the end
interface IRestrictedTransferHook is IBlocklistTransferHook {
  function setSourceAllowlist(IAccountList newSourceAllowlist) external;

  function setDestinationAllowlist(IAccountList newDestinationAllowlist) external;

  function getSourceAllowlist() external view returns (IAccountList);

  function getDestinationAllowlist() external view returns (IAccountList);
}
