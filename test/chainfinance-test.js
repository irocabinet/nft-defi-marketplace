const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DMart", function () {
  it("Should mint and trade NFTs", async function () {
    const Market = await ethers.getContractFactory("DMart");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;


    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAdress = nft.address;

    let listPrice = await market.listPrice();
    listPrice = listPrice.toString();

    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    await nft.mint('https-t1');
    await nft.mint('https-t2');

    await market.makeMarketItem(nftContractAdress, 1, auctionPrice, {value: listPrice});
    await market.makeMarketItem(nftContractAdress, 2, auctionPrice, {value: listPrice});

    const [_, buyerAddress] = await ethers.getSigners();

    await market.connect(buyerAddress).sale(nftContractAdress, 1, {
      value: auctionPrice
    }); 

    let items = await market.marketTokens();

    items = await Promise.all(items.map(async i => {
      const tokenURI = await 
    }));

    console.log('items', items);

  });
});
