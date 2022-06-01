// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

interface IERC1155Burnable is IERC1155, IERC1155MetadataURI {
  function burn(
    address account,
    uint256 id,
    uint256 amount
  ) external;
}
