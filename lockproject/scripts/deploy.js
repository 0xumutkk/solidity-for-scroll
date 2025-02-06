const { ethers } = require("hardhat");

async function main() {
  // 1) Token'ı deploy ediyoruz
  const LMToken = await ethers.getContractFactory("LMToken");
  const lmToken = await LMToken.deploy();
  await lmToken.waitForDeployment();  // <-- eskiden deployed() idi, şimdi waitForDeployment()

  const lmTokenAddress = await lmToken.getAddress(); // <-- eskiden lmToken.address
  console.log("LMToken deployed to:", lmTokenAddress);

  // 2) Lock kontratını deploy ediyoruz
  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(lmTokenAddress);
  await lock.waitForDeployment();

  const lockAddress = await lock.getAddress();
  console.log("Lock deployed to:", lockAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
