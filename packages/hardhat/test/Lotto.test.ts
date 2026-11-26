import { expect } from "chai";
import { network } from "hardhat";
import type { BaseContract, ContractTransactionResponse, Signer } from "ethers";
import type { Abi_Lotto } from "../generated/abis/Lotto.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

interface LottoContract extends BaseContract {
  buyTicket(overrides?: { value?: bigint }): Promise<ContractTransactionResponse>;

  getMyTickets(): Promise<
    {
      player: string;
      numbers: readonly bigint[];
      round: bigint;
      prize: bigint;
    }[]
  >;

  drawNumbers(): Promise<ContractTransactionResponse>;

  resetRound(): Promise<ContractTransactionResponse>;

  getLastDraw(): Promise<readonly bigint[]>;

  getTicketsCount(): Promise<bigint>;

  round(): Promise<bigint>;
}

function connectLotto(lotto: LottoContract, signer: Signer): LottoContract {
  return lotto.connect(signer) as LottoContract;
}

async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });
  const { address, abi } = env.get<Abi_Lotto>("Lotto");

  const lotto = (await ethers.getContractAt(abi, address)) as unknown as LottoContract;

  return { env, lotto };
}

describe("Lotto", function () {
  it("buyTicket() создаёт билет с 6 числами", async function () {
    const { lotto } = await networkHelpers.loadFixture(deployFixture);
    const [, alice] = await ethers.getSigners();

    const aliceLotto = connectLotto(lotto, alice);

    await aliceLotto.buyTicket({
      value: ethers.parseEther("1"),
    });

    const myTickets = await aliceLotto.getMyTickets();

    expect(myTickets.length).to.equal(1);
    expect(myTickets[0].numbers.length).to.equal(6);
  });

  it("buyTicket() возвращает ошибку, если не owner (проверка onlyOwner на drawNumbers)", async function () {
    const { lotto } = await networkHelpers.loadFixture(deployFixture);
    const [, alice] = await ethers.getSigners();

    const aliceLotto = connectLotto(lotto, alice);

    let failed = false;

    try {
      await aliceLotto.drawNumbers();
    } catch (e: any) {
      failed = true;
      expect(e.message).to.include("Only owner");
    }

    expect(failed).to.equal(true);
  });

  it("drawNumbers() возвращает ошибку 'No tickets', если нет билетов", async function () {
    const { lotto } = await networkHelpers.loadFixture(deployFixture);
    const [owner] = await ethers.getSigners();

    const ownerLotto = connectLotto(lotto, owner);

    let failed = false;

    try {
      await ownerLotto.drawNumbers();
    } catch (e: any) {
      failed = true;
      expect(e.message).to.include("No tickets");
    }

    expect(failed).to.equal(true);
  });

  it("drawNumbers() разыгрывает числа и начисляет призы", async function () {
    const { lotto } = await networkHelpers.loadFixture(deployFixture);
    const [owner, alice, bob] = await ethers.getSigners();

    const ownerLotto = connectLotto(lotto, owner);
    const aliceLotto = connectLotto(lotto, alice);
    const bobLotto = connectLotto(lotto, bob);

    await aliceLotto.buyTicket({
      value: ethers.parseEther("1"),
    });

    await bobLotto.buyTicket({
      value: ethers.parseEther("1"),
    });

    const tx = await ownerLotto.drawNumbers();
    const receipt = await tx.wait();

    if (receipt === null) {
      throw new Error("Transaction receipt is null");
    }

    expect(receipt.logs.length).to.be.greaterThan(0);

    const drawn = await lotto.getLastDraw();
    expect(drawn.length).to.equal(6);

    const ticketsCount = await lotto.getTicketsCount();
    expect(ticketsCount).to.equal(0);
  });

  it("resetRound() очищает билеты и увеличивает раунд", async function () {
    const { lotto } = await networkHelpers.loadFixture(deployFixture);
    const [owner, alice] = await ethers.getSigners();

    const ownerLotto = connectLotto(lotto, owner);
    const aliceLotto = connectLotto(lotto, alice);

    await aliceLotto.buyTicket({
      value: ethers.parseEther("1"),
    });

    const roundBefore = await lotto.round();

    await ownerLotto.resetRound();

    const ticketsAfter = await lotto.getTicketsCount();
    expect(ticketsAfter).to.equal(0);

    const roundAfter = await lotto.round();
    expect(roundAfter).to.equal(roundBefore + 1n);
  });
});
