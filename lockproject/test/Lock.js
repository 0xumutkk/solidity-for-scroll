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
    // Adresi yazdırırken Ethers v6'da target kullanılıyor
    console.log("LMToken deployed to:", token.target);

    Lock = await ethers.getContractFactory("Lock");
    // Lock kontratını deploy ederken token.target alıp kullanıyoruz
    lock = await Lock.connect(owner).deploy(token.target);
    await lock.waitForDeployment();
    console.log("Lock deployed to:", lock.target);

    // Ethers v6'da parseUnits ve parseEther doğrudan ethers üzerinden kullanılıyor
    await token.connect(owner).transfer(user1.address, ethers.parseUnits("100", 18));
    await token.connect(owner).transfer(user2.address, ethers.parseEther("50"));

    // Ethers v6'da MaxUint256 doğrudan ethers üzerinden kullanılıyor
    await token.connect(user1).approve(lock.target, ethers.MaxUint256);
    await token.connect(user2).approve(lock.target, ethers.MaxUint256);
  });

  /* beforeEach(async function (){
  })
  // beforeEach her it case inden önce kontrol edilecek şeyleri içerebilir
  */
  beforeEach(async function() {
    balances = [
        ethToNum(await token.balanceOf(owner.address)),
        ethToNum(await token.balanceOf(user1.address)),
        ethToNum(await token.balanceOf(user2.address)),
        ethToNum(await token.balanceOf(lock.target))
    ]
});
  it("Deploy the contracts", async function() {
    // Ethers v6'da adres kontrolü için target kullanılıyor
    expect(token.target).to.not.be.undefined;
    expect(lock.target).to.be.properAddress;
    //bunlar birer chai fonksiyonudur
  });

  it("Sends tokens", async function() {
    expect(balances[1]).to.be.equal(100);
    expect(balances[2]).to.be.equal(50);
    expect(balances[0]).to.be.greaterThan(balances[1]);
});

  // describe("Contract Function", function(){
  // })
  it("Approves", async function() {
    let allowances = [
        await token.allowance(user1.address, lock.target),
        await token.allowance(user2.address, lock.target),
    ]

    expect(allowances[0]).to.be.equal(ethers.MaxUint256);
    expect(allowances[0]).to.be.equal(allowances[1]);

});

it("Reverts exceeding transfer", async function () {
    await expect(token.connect(user1).transfer(user2.address, ethers.parseUnits("300", 18))).to.be.reverted;
});

describe("Contract Functions", function () {

    let lockerCount = 0;
    let totalLocked = 0;
    let userLocks = [0, 0];

    it("user1 locks 10 tokens", async function () {
        totalLocked += 10;
        userLocks[0] += 10;
        lockerCount++;
        await lock.connect(user1).lockTokens(ethers.parseEther("10"));

        expect(balances[3] + 10).to.be.equal(ethToNum(await token.balanceOf(lock.target)));
        expect(userLocks[0]).to.be.equal(ethToNum(await lock.lockers(user1.address)));
    });

    it("Locker count and locked amount increase", async function () {
        expect(await lock.lockerCount()).to.be.equal(lockerCount);
        expect(ethToNum(await lock.totalLocked())).to.be.equal(totalLocked);
    });

    it("user2 cannot withdraw tokens", async function () {
        await expect(lock.connect(user2).withdrawTokens()).to.be.reverted;
    });

    it("user1 withdraws token", async function () {
        totalLocked -= userLocks[0];
        userLocks[0] = 0;
        lockerCount--;
        await lock.connect(user1).withdrawTokens();

        expect(balances[3] - 10).to.be.equal(ethToNum(await token.balanceOf(lock.target)));
        expect(userLocks[0]).to.be.equal(ethToNum(await lock.lockers(user1.address)));
    });

    it("Locker count and locked amount decrease", async function () {
        expect(await lock.lockerCount()).to.be.equal(lockerCount);
        expect(ethToNum(await lock.totalLocked())).to.be.equal(totalLocked);
    });
    
    it("user1 position deleted", async function () {
        expect(await lock.lockers(user1.address)).to.be.equal(0);
    });

    it("user1 cannot withdraw more tokens", async function () {
        await expect(lock.connect(user1).withdrawTokens()).to.be.reverted;
    });
});

it("Prints timestamp", async function () {
    let block_number = await provider.getBlockNumber();
    let block = await provider.getBlock(block_number);
    console.log("timestamp:", block.timestamp);
})
});

// Helper function to convert ethers.BigNumber to number
function ethToNum(bn) {
  return parseFloat(ethers.formatEther(bn));
}