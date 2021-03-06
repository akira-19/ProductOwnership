pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/// @title A contract for managing ownerships
/// @author akira-19
/// @notice In this contract, you can register your product to blockchain, which everyone can see what is your product. Also, able to give the ownerships.
contract ProductOwnership is ERC721Full, Ownable {
    uint incrementId = 0;

    constructor(string memory name, string memory symbol) ERC721Full(name, symbol) public {

    }

    struct product {
        uint productId;
        string productName;
        string productCategory;
    }
    product[] public products;

    mapping (uint => uint) tokenIdToArrayElemNum;

    event RegisterProduct(uint productId, string productName, string productCategory);
    event ApproveOwnership(address currentOwner, address indexed newOwner, uint productId, string productName);
    event TakeOwnership(address currentOwner, address newOwner, uint product);

    modifier onlyOwnerOf(uint _productId) {
        require(super.ownerOf(_productId) == msg.sender);
        _;
    }

    /**
     * @dev Register a product as the sender's belongings on blockchain
     * @param _name of the product and product category
     */
    function registerProduct(string memory _name, string memory _category) public {
        uint currentNumberOfProducts = products.length;
        uint rondNum = _generateRondomNumber(currentNumberOfProducts);
        super._mint(msg.sender, rondNum);
        incrementId = products.push(product(rondNum, _name, _category)) - 1;
        tokenIdToArrayElemNum[rondNum] = incrementId;

        emit RegisterProduct(rondNum, _name, _category);
    }

    function _generateRondomNumber(uint _num) private pure returns (uint) {
        return uint(keccak256(abi.encode(_num)));
    }

    function showOwnedProducts() public view returns(uint[] memory) {
        uint ownedProductCount = super.balanceOf(msg.sender);
        uint[] memory product_ids = new uint[](ownedProductCount);
        uint counter = 0;
        for(uint i=0; i < products.length; i++){
           if(super.ownerOfProduct(products[i].productId) == msg.sender){
               product_ids[counter] = i;
               counter++;
           }
        }
        return product_ids;
    }

    function checkIfApproved(uint _tokenId) public view returns(bool) {
        if (getApproved(_tokenId) == address(0) || getApproved(_tokenId) == msg.sender){
            return false;
        }else{
            return true;
        }
    }

    function approveOwnership(address _to, uint _productId) public {
        super.approve(_to, _productId);
        uint arrayElemNum = tokenIdToArrayElemNum[_productId];
        product memory prd = products[arrayElemNum];
        emit ApproveOwnership(msg.sender, _to, _productId, prd.productName);
    }

    function deleteOwnership(address _owner, uint256 _tokenId) public {
        super._burn(_owner, _tokenId);
    }





}
