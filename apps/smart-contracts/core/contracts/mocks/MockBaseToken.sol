// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract MockBaseToken is ERC20, Ownable {
  address private _mockStrategy;

  constructor() ERC20('Mock Base Token', 'MBT') {}

  modifier onlyMockStrategy() {
    require(msg.sender == _mockStrategy, 'Caller is not MockStrategy');
    _;
  }

  function mint(address _recipient, uint256 _amount) external onlyMockStrategy {
    _mint(_recipient, _amount);
  }

  function ownerMint(uint256 _amount) external onlyOwner {
    _mint(owner(), _amount);
  }

  function setMockStrategy(address _newMockStrategy) external onlyOwner {
    _mockStrategy = _newMockStrategy;
  }

  function getMockStrategy() external view returns (address) {
    return _mockStrategy;
  }
}
