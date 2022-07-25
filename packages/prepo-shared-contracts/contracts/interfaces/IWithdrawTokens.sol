// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

// TODO: add natspec comments
interface IWithdrawTokens {
  function batchWithdrawERC20(address[] calldata erc20Tokens, uint256[] calldata amounts) external;

  function batchWithdrawERC721(address[] calldata erc721Tokens, uint256[] calldata ids) external;
}
