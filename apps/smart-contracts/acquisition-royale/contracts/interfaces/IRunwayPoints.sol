// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IRunwayPoints is IERC20 {
  function mint(address recipient, uint256 amount) external;

  function burnFrom(address account, uint256 amount) external;
}
