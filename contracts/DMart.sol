// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract DMart is ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _tokensSold;

    address payable marketplace_owner;
    uint256 listingPrice = 0.045 ether;

    constructor(){
        marketplace_owner = payable(msg.sender);
    }

    struct MarketToken {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping (uint256 => MarketToken) private idToMarketToken;

    event MarketTokenMinted(uint256 indexed itemId, address indexed nftContract, uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold);

    function listPrice() public view returns (uint256) {
        return listingPrice;
    }

    function mintMarketItem(address nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
        require(price > 0, "Price must be a reasonable value");
        require(msg.value == listingPrice, "Price must be equal to listing price");
        _tokenIds.increment();
        uint256 itemId = _tokenIds.current();
        idToMarketToken[itemId] = MarketToken(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable (address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketTokenMinted(itemId, nftContract, tokenId, msg.sender, address(0), price, false);
    }

    function sale(address nftContract, uint256 itemId) public payable nonReentrant {
        uint256 price = idToMarketToken[itemId].price;
        uint256 tokenId = idToMarketToken[itemId].tokenId;
        require(msg.value == price, "Please submit the ask price!");
        idToMarketToken[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketToken[itemId].owner = payable(msg.sender);
        idToMarketToken[itemId].sold = true;
        _tokensSold.increment();
        payable(marketplace_owner).transfer(listingPrice);
    }

    function marketTokens() public view returns(MarketToken[] memory){
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _tokensSold.current();
        uint256 currentIndex = 0;
        MarketToken[] memory items = new MarketToken[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++){
            if (idToMarketToken[i+1].owner == address(0)){
                uint256 currentId = i+1;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }

    function nfts() public view returns(MarketToken[] memory){
        uint256 itemCount = _tokenIds.current();
        uint256 ownedCount = 0;       
        for (uint256 i = 0; i < itemCount; i++){
            if (idToMarketToken[i+1].owner == msg.sender){
                ownedCount++;
            }
        }
        MarketToken[] memory items = new MarketToken[](ownedCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < ownedCount; i++){
            if (idToMarketToken[i+1].owner == msg.sender){
                uint256 currentId = idToMarketToken[i+1].itemId;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items; 
    }

    function minted() public view returns (MarketToken[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 ownedCount = 0;       
        for (uint256 i = 0; i < itemCount; i++){
            if (idToMarketToken[i+1].seller == msg.sender){
                ownedCount++;
            }
        }
        MarketToken[] memory items = new MarketToken[](ownedCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < ownedCount; i++){
            if (idToMarketToken[i+1].seller == msg.sender){
                uint256 currentId = idToMarketToken[i+1].itemId;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;        
    }
}