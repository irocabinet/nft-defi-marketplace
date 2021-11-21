require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
module.exports = {
  solidity: "0.8.4",
  setings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545"
    },
    mumbai: {
      url: process.env.MUMBAI_URL,
      accounts: [ process.env.PRIVATE_KEY ]
    }
  }
};
