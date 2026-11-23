import { expect } from "chai";
import { network } from "hardhat";
import type { Abi_Lottery } from "../generated/abis/Lottery.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

// Фикстура: загружаем уже задеплоенный Lottery
async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });
  const { address, abi } = env.get<Abi_Lottery>("Lottery");
  const lottery = await ethers.getContractAt(abi, address);
  return { env, lottery };
}

describe("Lottery", function () {
  it("buyTicket() добавляет отправителя в список участников", async function () {
    const { lottery } = await networkHelpers.loadFixture(deployFixture);
    const [, alice] = await ethers.getSigners();

    await lottery.connect(alice).buyTicket();

    const players = await lottery.getPlayers();
    expect(players.map((p: string) => p.toLowerCase())).to.include((await alice.getAddress()).toLowerCase());
  });

  it("buyTicket() возвращает ошибку 'Already in this round' при повторной покупке", async function () {
    const { lottery } = await networkHelpers.loadFixture(deployFixture);
    const [, alice] = await ethers.getSigners();

    await lottery.connect(alice).buyTicket();

    let failed = false;
    try {
      await lottery.connect(alice).buyTicket();
    } catch (e: any) {
      failed = true;
      expect(e.message).to.include("Already in this round");
    }
    expect(failed).to.equal(true);
  });

  it("pickWinner() возвращает ошибку 'No players', если нет участников", async function () {
    const { lottery } = await networkHelpers.loadFixture(deployFixture);
    const [owner] = await ethers.getSigners();

    let failed = false;
    try {
      await lottery.connect(owner).pickWinner();
    } catch (e: any) {
      failed = true;
      expect(e.message).to.include("No players");
    }
    expect(failed).to.equal(true);
  });

  it("pickWinner() возвращает ошибку 'Only owner', если вызывает не владелец", async function () {
    const { lottery } = await networkHelpers.loadFixture(deployFixture);
    const [, alice] = await ethers.getSigners();

    let failed = false;
    try {
      await lottery.connect(alice).pickWinner();
    } catch (e: any) {
      failed = true;
      expect(e.message).to.include("Only owner");
    }
    expect(failed).to.equal(true);
  });

  it("pickWinner() испускает WinnerPicked и сбрасывает список участников", async function () {
    const { lottery } = await networkHelpers.loadFixture(deployFixture);
    const [owner, alice, bob] = await ethers.getSigners();

    await lottery.connect(alice).buyTicket();
    await lottery.connect(bob).buyTicket();

    const tx = await lottery.connect(owner).pickWinner();
    const receipt = await tx.wait();

    expect(receipt.logs.length).to.be.greaterThan(0);

    const playersAfter = await lottery.getPlayers();
    expect(playersAfter.length).to.equal(0);

    const [winner, round] = await lottery.getWinner();
    expect(winner).to.not.equal("0x0000000000000000000000000000000000000000");
    expect(round).to.equal(1n);
  });
});
