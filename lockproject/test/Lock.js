//const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = ethers.provider;

describe("Lock Contract", function () {

  let owner, user1, user2;
  let Token, token;
  let Lock, lock;
  //  before,beforeEach,after, afterEach,it

  before(async function() {
    [owner, user1, user2] = await ethers.getSigners();

    Token = await ethers.getContractFactory("LMToken");
    token = await Token.connect(owner).deploy();
    // Ethers v6'da sözleşmenin tamamen deploy olmasını beklemek
    await token.waitForDeployment();
    // Adresi yazdırırken Ethers v6'da getAddress() kullanılıyor
    console.log("LMToken deployed to:", await token.getAddress());

    Lock = await ethers.getContractFactory("Lock");
    // Lock kontratını deploy ederken token.getAddress() alıp kullanıyoruz
    lock = await Lock.connect(owner).deploy(await token.getAddress());
    await lock.waitForDeployment();
    console.log("Lock deployed to:", await lock.getAddress());
  });

  /* beforeEach(async function (){
  })
  // beforeEach her it case inden önce kontrol edilecek şeyleri içerebilir
  */

  it("Deploy the contracts", async function() {
    // Ethers v6'da adres kontrolü için getAddress() çağırmak gerekiyor
    expect(await token.getAddress()).to.not.be.undefined;
    expect(await lock.getAddress()).to.be.properAddress;
    //bunlar birer chai fonksiyonudur
  });

  // describe("Contract Function", function(){
  // })

});
