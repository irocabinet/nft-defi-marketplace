const hre = require("hardhat");
const fs  = require('fs');

async function main() {
  const DMart = await hre.ethers.getContractFactory("DMart");
  const dMart = await DMart.deploy();
  await dMart.deployed();
  console.log("DMart contract deployed to:", dMart.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(dMart.address);
  await nft.deployed();
  console.log("NFT contract deployed to:", nft.address);

  let config = `
    export const dMartAddress = ${dMart.address}
    export const nftAddress = ${nft.address}
  `;
  let data = JSON.stringify(config);
  fs.writeFileSync('config.js', JSON.parse(data));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
