var IPFSstorage = artifacts.require("./IPFSstorage.sol");

module.exports = function(deployer) {
    // Demo is the contract's name
    deployer.deploy(IPFSstorage);
};