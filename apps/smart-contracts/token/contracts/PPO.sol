pragma solidity =0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PPO is ERC20Upgradeable, OwnableUpgradeable {
  function initialize() public initializer {
    OwnableUpgradeable.__Ownable_init();
    ERC20Upgradeable.__ERC20_init("prePO Token", "PPO");
    _mint(msg.sender, 1e27); // 1 billion
  }
}
