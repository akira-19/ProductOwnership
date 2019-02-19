// オブジェクトリテラル
App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
      // Modern dapp browsers...
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
  }
  web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
      $.getJSON('ProductOwnership.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var ProductOwnershipArtifact = data;
    App.contracts.ProductOwnership = TruffleContract(ProductOwnershipArtifact);
    // Set the provider for our contract
    App.contracts.ProductOwnership.setProvider(App.web3Provider);
    // Use our contract to retrieve and mark the adopted pets
    return App.showproducts();
  });
    return App.registerNewProduct();
  },

  showproducts: function() {
      var productOwnershipInstance;
      // deployed(): Create an instance of MyContract that represents the default address managed by MyContract.
      // FYI: new(): Deploy a new version of this contract to the network, getting an instance > of MyContract that represents the newly deployed instance.
      // see https://ethereum.stackexchange.com/questions/48709/how-is-it-different-deployed-and-new

      App.contracts.ProductOwnership.deployed().then(function(instance) {
          productOwnershipInstance = instance;

          return productOwnershipInstance.showOwnedProducts.call();

      }).then(function(products_ids) {
          $('#car_list ul, #smartphone_list ul, #computer_list ul').empty();
          for (var i = 0; i < products_ids.length; i++) {
              productOwnershipInstance.products(i).then(productNumber =>{
                  switch (productNumber[2]) {
                      case "0":
                        $('#car_list ul').append('<li>'+ productNumber[1] +'</li>')
                          break;
                      case "1":
                        $('#smartphone_list ul').append('<li>'+ productNumber[1] +'</li>')
                          break;
                      case "2":
                        $('#computer_list ul').append('<li>'+ productNumber[1] +'</li>')
                          break;
                  }
              });

          }
      }).catch(function(err) {
          console.log(err.message);
      });
  },

 registerNewProduct: function(){
     $(document).on('click', '#regster_btn', function(event){
         event.preventDefault();
         let productOwnershipInstance;
         let productName = $('#productName').val();
         let productCategory = $('#productCategory option:selected').val();

         web3.eth.getAccounts(function(error, accounts) {
             if (error) {
                 console.log(error);
             }
             var account = accounts[0];

             App.contracts.ProductOwnership.deployed().then(function(instance){
                 productOwnershipInstance = instance;
                 return productOwnershipInstance.registerProduct(productName, productCategory);
             }).then(function(result){
                 return App.showproducts();
             }).catch(function(err) {
                 console.log(err.message)
             });
         })
     })
     },

 giveOwnership: function() {

 },

 takeOwnership: function() {

 },

 deleteOwnership: function () {

 }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
