// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "./IERC1155Burnable.sol";

interface IAcquisitionRoyaleConsumables is IERC1155Burnable {
  event NameChanged(string name);
  event SymbolChanged(string symbol);

  /**
   * Sets the URI for Rename tokens. Emits a URI event.
   * @dev function can only be called by owner().
   */
  function setRenameUri(string memory newRenameUri) external;

  /**
   * Sets the URI for Rebrand tokens. Emits a URI event.
   * @dev function can only be called by owner().
   */
  function setRebrandUri(string memory newRebrandUri) external;

  /**
   * Sets the URI for Revive tokens. Emits a URI event.
   * @dev function can only be called by owner().
   */
  function setReviveUri(string memory newReviveUri) external;

  /**
   * Sets the name of this collection. Emits a NameChanged event.
   * @dev function can only be called by owner(). Not mandated by ERC1155 standard, for use with OpenSea.
   */
  function setName(string memory newName) external;

  /**
   * Sets the symbol of this collection. Emits a SymbolChanged event.
   * @dev function can only be called by owner(). Not mandated by ERC1155 standard, for use with OpenSea.
   */
  function setSymbol(string memory newSymbol) external;

  /// Returns the URI for Revive tokens.
  function getRenameUri() external view returns (string memory);

  /// Returns the URI for Rebrand tokens.
  function getRebrandUri() external view returns (string memory);

  /// Returns the URI for Revive tokens.
  function getReviveUri() external view returns (string memory);

  /// Returns the address of the Acquisition Royale contract allowed to burn tokens without approval.
  function getAcquisitionRoyale() external view returns (address);
}
