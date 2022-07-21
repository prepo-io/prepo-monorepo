// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./SafeOwnable.sol";
import "./interfaces/IToken.sol";

contract Token is IToken, SafeOwnable {
  address private _token;

  modifier onlyToken() {
    require(msg.sender == _token, "msg.sender != token");
    _;
  }

  constructor() {}

  function setToken(address _newToken) external override onlyOwner {
    _token = _newToken;
  }

  function getToken() external view override returns (address) {
    return _token;
  }
}
