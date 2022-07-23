// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/ITokenShop.sol";
import "./interfaces/IPurchaseHook.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";
import "prepo-shared-contracts/contracts/Pausable.sol";

contract TokenShop is ITokenShop, SafeOwnable, ReentrancyGuard, Pausable {
  using SafeERC20 for IERC20;

  IERC20 private _paymentToken;
  IPurchaseHook private _purchaseHook;
  mapping(address => mapping(uint256 => uint256)) private _contractToIdToPrice;
  mapping(address => mapping(address => uint256)) private _userToERC721ToPurchaseCount;
  mapping(address => mapping(address => mapping(uint256 => uint256)))
    private _userToERC1155ToIdToPurchaseCount;

  constructor(address _nominatedOwner, address _newPaymentToken) {
    transferOwnership(_nominatedOwner);
    _paymentToken = IERC20(_newPaymentToken);
  }

  function setContractToIdToPrice(
    address[] memory _tokenContracts,
    uint256[] memory _ids,
    uint256[] memory _prices
  ) external override onlyOwner {
    require(
      _tokenContracts.length == _prices.length && _ids.length == _prices.length,
      "Array length mismatch"
    );
    for (uint256 i; i < _tokenContracts.length; ++i) {
      _contractToIdToPrice[_tokenContracts[i]][_ids[i]] = _prices[i];
    }
  }

  function setPurchaseHook(address _newPurchaseHook) external override onlyOwner {
    _purchaseHook = IPurchaseHook(_newPurchaseHook);
  }

  function purchase(
    address[] memory _tokenContracts,
    uint256[] memory _ids,
    uint256[] memory _amounts
  ) external override nonReentrant whenNotPaused {
    require(
      _tokenContracts.length == _amounts.length && _ids.length == _amounts.length,
      "Array length mismatch"
    );
    require(address(_purchaseHook) != address(0), "Purchase hook not set");
    for (uint256 i; i < _tokenContracts.length; ++i) {
      require(_contractToIdToPrice[_tokenContracts[i]][_ids[i]] != 0, "Non-purchasable item");
      uint256 _totalPaymentAmount = _contractToIdToPrice[_tokenContracts[i]][_ids[i]] * _amounts[i];
      _paymentToken.transferFrom(_msgSender(), address(this), _totalPaymentAmount);
      bool _isERC1155 = IERC1155(_tokenContracts[i]).supportsInterface(type(IERC1155).interfaceId);
      if (_isERC1155) {
        _purchaseHook.hookERC1155(msg.sender, _tokenContracts[i], _ids[i], _amounts[i]);
        _userToERC1155ToIdToPurchaseCount[msg.sender][_tokenContracts[i]][_ids[i]] += _amounts[i];
        IERC1155(_tokenContracts[i]).safeTransferFrom(
          address(this),
          _msgSender(),
          _ids[i],
          _amounts[i],
          ""
        );
      } else {
        _purchaseHook.hookERC721(msg.sender, _tokenContracts[i], _ids[i]);
        ++_userToERC721ToPurchaseCount[msg.sender][_tokenContracts[i]];
        IERC721(_tokenContracts[i]).safeTransferFrom(address(this), _msgSender(), _ids[i]);
      }
    }
  }

  function withdrawERC20(address _erc20Token, uint256 _amount)
    external
    override
    onlyOwner
    nonReentrant
  {
    IERC20(_erc20Token).safeTransfer(owner(), _amount);
  }

  function withdrawERC721(address _erc721Token, uint256 _id)
    external
    override
    onlyOwner
    nonReentrant
  {
    IERC721(_erc721Token).safeTransferFrom(address(this), owner(), _id);
  }

  function withdrawERC1155(
    address _erc1155Token,
    uint256 _id,
    uint256 _amount
  ) external override onlyOwner nonReentrant {
    IERC1155(_erc1155Token).safeTransferFrom(address(this), owner(), _id, _amount, "");
  }

  function getPrice(address _tokenContract, uint256 _id) external view override returns (uint256) {
    return _contractToIdToPrice[_tokenContract][_id];
  }

  function getPaymentToken() external view override returns (address) {
    return address(_paymentToken);
  }

  function getPurchaseHook() external view override returns (IPurchaseHook) {
    return _purchaseHook;
  }

  function getERC721PurchaseCount(address _user, address _tokenContract)
    external
    view
    override
    returns (uint256)
  {
    _userToERC721ToPurchaseCount[_user][_tokenContract];
  }

  function getERC1155PurchaseCount(
    address _user,
    address _tokenContract,
    uint256 _id
  ) external view override returns (uint256) {
    return _userToERC1155ToIdToPurchaseCount[_user][_tokenContract][_id];
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

  function onERC721Received(
    address,
    address,
    uint256,
    bytes memory
  ) external pure returns (bytes4) {
    return this.onERC721Received.selector;
  }
}
