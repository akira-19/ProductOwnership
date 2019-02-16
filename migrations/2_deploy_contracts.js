var ProductOwnership = artifacts.require("./ProductOwnership.sol");

module.exports = function(deployer) {
  deployer.deploy(ProductOwnership, "ProductOwnership", "products");
};
