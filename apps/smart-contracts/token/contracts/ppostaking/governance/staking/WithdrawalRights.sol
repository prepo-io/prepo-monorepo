// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

// TODO update compiler to 0.8.7

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract WithdrawalRights is Ownable, ERC721 {
  uint256 private _id;
  string private _uri;
  address private _ppoStaking;

  modifier onlyPPOStaking() {
    require(msg.sender == _ppoStaking, "msg.sender != PPOStaking");
    _;
  }

  constructor(address _governance) ERC721("Staked PPO Withdrawal Rights", "stkPPO-WR") {
    // TODO: switch to nominate + accept after pragma is updated.
    _transferOwnership(_governance);
  }

  function setURI(string memory _newURI) external onlyOwner {
    _uri = _newURI;
  }

  function setPPOStaking(address _newPPOStaking) external onlyOwner {
    _ppoStaking = _newPPOStaking;
  }

  function mint(address _to) external onlyPPOStaking {
    _safeMint(_to, _id++);
  }

  // solhint-disable-next-line no-unused-vars
  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    return _uri;
  }

  function getPPOStaking() external view returns (address) {
    return _ppoStaking;
  }
}
