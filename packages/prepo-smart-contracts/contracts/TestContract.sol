// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "hardhat/console.sol";

contract TestContract {
  event SetMessage(address sender, string purpose);

  string public message = "prePO Test contract";

  constructor() {}

  function setMessage(string memory newMessage) public {
    message = newMessage;
    console.log(msg.sender, "set message to", message);
    emit SetMessage(msg.sender, message);
  }
}
