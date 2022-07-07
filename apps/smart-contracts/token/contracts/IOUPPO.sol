// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./interfaces/IIOUPPO.sol";

contract IOUPPO is IIOUPPO, ERC20Upgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  IERC20Upgradeable private _ppoToken;
  address private _ppoStaking;
  bool private _paused;
  bytes32 private _root;
  mapping(address => bool) private _hasClaimed;
  mapping(address => bool) private _hasStaked;

  /// @dev owner needs to be set as the prePO governance address not the deployer
  function initialize(address _governance) public initializer {
    ERC20Upgradeable.__ERC20_init("IOU PPO Token", "IOUPPO");
    OwnableUpgradeable.__Ownable_init();
    __ReentrancyGuard_init();
    _transferOwnership(_governance);
  }

  modifier whenNotPaused() {
    require(!_paused, "paused");
    _;
  }

  function setPPOToken(address _newPPOToken) external override onlyOwner {
    _ppoToken = IERC20Upgradeable(_newPPOToken);
  }

  function setPPOStaking(address _newPPOStaking) external override onlyOwner {
    _ppoStaking = _newPPOStaking;
  }

  function setPaused(bool _newPaused) external override onlyOwner {
    _paused = _newPaused;
    emit PausedChanged(_newPaused);
  }

  function setMerkleTreeRoot(bytes32 _newRoot) external override onlyOwner {
    _root = _newRoot;
  }

  function claim(
    uint256 _amount,
    bool _staked,
    bytes32[] memory _proof
  ) external override whenNotPaused nonReentrant {
    require(!_hasClaimed[msg.sender], "Already claimed");
    bytes32 _leaf = keccak256(abi.encodePacked(msg.sender, _amount, _staked));
    require(MerkleProof.verify(_proof, _root, _leaf), "Invalid claim");
    _hasClaimed[msg.sender] = true;
    _hasStaked[msg.sender] = _staked;
    _mint(msg.sender, _amount);
  }

  function convert(bool _shouldStake) external override whenNotPaused nonReentrant {
    require(address(_ppoToken) != address(0), "PPO address not set");
    uint256 _callerIOUPPOBalance = balanceOf(msg.sender);
    require(_callerIOUPPOBalance > 0, "IOUPPO balance = 0");
    require(
      _ppoToken.balanceOf(address(this)) >= _callerIOUPPOBalance,
      "Insufficient PPO in contract"
    );
    _burn(msg.sender, _callerIOUPPOBalance);
    if (_shouldStake || _hasStaked[msg.sender]) {
      require(_ppoStaking != address(0), "PPOStaking address not set");
      //TODO : call `stake` on `PPOStaking.sol` if _shouldStake or _hasStaked
    } else {
      _ppoToken.transfer(msg.sender, _callerIOUPPOBalance);
    }
  }

  function withdrawERC20(address _token, uint256 _amount) external override onlyOwner nonReentrant {
    IERC20Upgradeable(_token).safeTransfer(owner(), _amount);
  }

  function getPPOToken() external view override returns (address) {
    return address(_ppoToken);
  }

  function getPPOStaking() external view override returns (address) {
    return _ppoStaking;
  }

  function getPaused() external view override returns (bool) {
    return _paused;
  }

  function getMerkleTreeRoot() external view override returns (bytes32) {
    return _root;
  }

  function hasClaimed(address _account) external view override returns (bool) {
    return _hasClaimed[_account];
  }

  function hasStaked(address _account) external view override returns (bool) {
    return _hasStaked[_account];
  }
}
