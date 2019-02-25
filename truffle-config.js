const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic ="property flush police undo warfare pulp awful obscure match know paddle acoustic";
const infura_url = "https://ropsten.infura.io/v3/841d5eaaca754b389a7a3c1c8a0bd60e"
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 4500000
      },
    ropsten:{
      provider: function(){
          return new HDWalletProvider(mnemonic, infura_url)
      },
      network_id:3,
      gas: 4700000
    }
  }
};
