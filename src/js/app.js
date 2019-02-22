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
          $('#car_list table, #smartphone_list table, #computer_list table').empty();
          for (var i = 0; i < products_ids.length; i++) {
              const productId = "product-" + products_ids[i];
              let productTokenId;
              let productName;
              let productCategory;
              productOwnershipInstance.products(products_ids[i]).then(productNumber =>{
                  productTokenId = productNumber[0];
                  productName = productNumber[1];
                  productCategory = productNumber[2];
                  return productOwnershipInstance.checkIfApproved(productTokenId)
              }).then(result =>{
                  var giveButton;
                  var deleteButton;
                  if (result) {
                      giveButton = "btn-secondary";
                      deleteButton = "btn-secondary";
                  }else{
                      giveButton = "btn-success giveProduct";
                      deleteButton = "btn-danger deleteProduct";
                  }
                  switch (productCategory) {
                      case "0":
                        $('#car_list table').append("<tr id=" +productId+ "><td>"
                        + productName
                        +'</td>'
                        +"<td><button class='btn "
                        + giveButton
                        +"' onclick='App.giveOwnership()'>Give</button></td>"
                        +"<td><button class='btn "
                        + deleteButton
                        +"'>Delete</button></td></tr>");
                          break;
                      case "1":
                        $('#smartphone_list table').append("<tr id=" +productId+ "><td>"
                        + productName
                        +'</td>'
                        +"<td><button class='btn "
                        + giveButton
                        +"' onclick='App.giveOwnership()'>Give</button></td>"
                        +"<td><button class='btn "
                        + deleteButton
                        +"'>Delete</button></td></tr>");
                          break;
                      case "2":
                        $('#computer_list table').append("<tr id=" +productId+ "><td>"
                        + productName
                        +'</td>'
                        +"<td><button class='btn "
                        + giveButton
                        +"' onclick='App.giveOwnership()'>Give</button></td>"
                        +"<td><button class='btn "
                        + deleteButton
                        +"'>Delete</button></td></tr>");
                          break;
                  }

              });

          }
      }).then(() => {
          web3.eth.getAccounts((error, accounts) => {
              var account = accounts[0]
              var approveEvent = productOwnershipInstance.ApproveOwnership({newOwner: account}, {fromBlock:1, toBlock:"latest"});
              approveEvent.watch((error, result) => {
                  $("#transaction_list").append("<tr id='"+result.args.productId+"'><td>"+result.args.currentOwner+"</td>"
                  + "<td>"+result.args.productName+"</td>"
                  + "<td><button class='btn btn-primary acceptOwnershipButton'>Accept</button></td>"
                  + "<td><button class='btn btn-danger rejectOwnershipButton'>Reject</button></td></tr>");
              });
          });
      }).catch(function(err) {
          console.log(err.message);
      });
  },

// Approval(owner, to, tokenId)
//
//
//   var theDAOTransferEvent = theDAO.Transfer({}, {fromBlock: theDAOStartingBlock, toBlock: theDAOStartingBlock + 2000});
//   console.log("address\tfrom\t\tto\tamount\tblockHash\tblockNumber\tevent\tlogIndex\ttransactionHash\ttransactionIndex");
//   theDAOTransferEvent.watch(function(error, result){
//     console.log(result.address + "\t" + result.args._from + "\t" + result.args._to + "\t" +
//       result.args._amount / 1e16 + "\t" +
//       result.blockHash + "\t" + result.blockNumber + "\t" + result.event + "\t" + result.logIndex + "\t" +
//       result.transactionHash + "\t" + result.transactionIndex);
//
//   });





 registerNewProduct: function(){
     $(document).on('click', '#regster_btn', function(event){
         event.preventDefault();
         let productOwnershipInstance;
         let productName = $('#productName').val();
         let productCategory = $('#productCategory option:selected').val();

         App.contracts.ProductOwnership.deployed().then(function(instance){
             productOwnershipInstance = instance;
             return productOwnershipInstance.registerProduct(productName, productCategory);
         }).then(function(result){
             return App.showproducts();
         }).catch(function(err) {
             console.log(err.message)
         });

     });
     },

 giveOwnership: function() {
     $(document).off('click');
     $(document).on('click','.giveProduct', function(event){
         event.preventDefault();
         var productOwnershipInstance;
         var buttonId = $(this).parent().parent().attr("id");
         var productId = buttonId.replace("product-", "");
         var toAddress = prompt("Input the address you want to send the product.");

         web3.eth.getAccounts(function(error, accounts) {
             if (error) {
                 console.log(error);
             }
             var account = accounts[0];

             App.contracts.ProductOwnership.deployed().then(instance => {
                 productOwnershipInstance = instance;
                 return productOwnershipInstance.products(productId);
             }).then(productNumber => {
                 var productTokenId = productNumber[0];
                 return productOwnershipInstance.approveOwnership(toAddress, productTokenId);
             }).then(function(result){
                 console.log();
                 return App.showproducts();
             }).catch(function(err) {
                 console.log(err.message)
             });
         });

     });
 },

 takeOwnership: function() {
     $(document).off('click');
     $(document).on('click','.giveProduct', function(event){
         event.preventDefault();

     })
 },

 deleteOwnership: function () {

 }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
