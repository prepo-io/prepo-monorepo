// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

//TODO: add all natspecs at the end
interface ITransferHook {
    function hook(address from, address to, uint256 amount) external;
}