// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IWithdrawTokens.sol";
import "./SafeOwnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract WithdrawTokens is IWithdrawTokens, SafeOwnable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  constructor() {}

  function batchWithdrawERC20(address[] calldata _erc20Tokens, uint256[] calldata _amounts)
    external
    override
    onlyOwner
    nonReentrant
  {
    require(_erc20Tokens.length == _amounts.length, "Array length mismatch");
    for (uint256 i; i < _erc20Tokens.length; ++i) {
      IERC20(_erc20Tokens[i]).safeTransfer(owner(), _amounts[i]);
    }
  }

  function batchWithdrawERC721(address[] calldata _erc721Tokens, uint256[] calldata _ids)
    external
    override
    onlyOwner
    nonReentrant
  {
    require(_erc721Tokens.length == _ids.length, "Array length mismatch");
    for (uint256 i; i < _erc721Tokens.length; ++i) {
      IERC721(_erc721Tokens[i]).safeTransferFrom(address(this), owner(), _ids[i]);
    }
  }

  function batchWithdrawERC1155(
    address[] calldata _erc1155Tokens,
    uint256[] calldata _ids,
    uint256[] calldata _amounts
  ) external override onlyOwner nonReentrant {
    require(
      _erc1155Tokens.length == _amounts.length && _ids.length == _amounts.length,
      "Array length mismatch"
    );
    for (uint256 i; i < _erc1155Tokens.length; ++i) {
      IERC1155(_erc1155Tokens[i]).safeTransferFrom(
        address(this),
        owner(),
        _ids[i],
        _amounts[i],
        ""
      );
    }
  }

  function onERC721Received(
    address,
    address,
    uint256,
    bytes memory
  ) external pure returns (bytes4) {
    return this.onERC721Received.selector;
  }

  function onERC1155Received(
    address,
    address,
    uint256,
    uint256,
    bytes memory
  ) external pure returns (bytes4) {
    return this.onERC1155Received.selector;
  }

  function onERC1155BatchReceived(
    address,
    address,
    uint256[] memory,
    uint256[] memory,
    bytes memory
  ) external pure returns (bytes4) {
    return this.onERC1155BatchReceived.selector;
  }
}
