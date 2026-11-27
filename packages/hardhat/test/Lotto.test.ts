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
  it("buyTicket() создает билет с 6 числами", async function () {
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

  it("buyTicket() возвращает ошибку, если вызывающий не owner (проверка onlyOwner на drawNumbers)", async function () {
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

  it("drawNumbers() начисляет приз и создает событие PrizePaid", async function () {
    const [owner, alice] = await ethers.getSigners();

    const harness = await ethers.deployContract("LottoTestHarness");
    await harness.waitForDeployment();

    const lottoAddress = await harness.getAddress();
    const testLotto = harness.connect(owner);

    const ticketNumbers = [1, 2, 3, 4, 5, 6];

    // Добавляем тестовый билет с заранее известными числами.
    await testLotto.seedTicket(alice.address, ticketNumbers);

    // Пополняем контракт средствами для выплаты максимального приза.
    await owner.sendTransaction({
      to: lottoAddress,
      value: ethers.parseEther("100"),
    });

    let successfulReceipt: Awaited<ReturnType<NonNullable<ContractTransactionResponse["wait"]>>> | null = null;

    let actualMatches = 0;

    // Повторяем розыгрыш, пока не получим минимум три совпадения.
    for (let attempt = 0; attempt < 100; attempt++) {
      const tx = await testLotto.drawNumbers();
      const receipt = await tx.wait();

      if (receipt === null) {
        throw new Error("Transaction receipt is null");
      }

      const drawn = await harness.getLastDraw();

      actualMatches = ticketNumbers.filter(number => drawn.some(drawnNumber => Number(drawnNumber) === number)).length;

      if (actualMatches >= 3) {
        successfulReceipt = receipt;
        break;
      }

      // После неудачного розыгрыша билеты удаляются.
      // Добавляем тот же тестовый билет в следующий раунд.
      if (attempt < 99) {
        await testLotto.seedTicket(alice.address, ticketNumbers);
      }
    }

    expect(successfulReceipt).not.to.equal(null);
    expect(actualMatches).to.be.at.least(3);

    // Определяем ожидаемый размер приза по количеству совпадений.
    let expectedPrize: bigint;

    if (actualMatches === 3) {
      expectedPrize = ethers.parseEther("0.1");
    } else if (actualMatches === 4) {
      expectedPrize = ethers.parseEther("1");
    } else if (actualMatches === 5) {
      expectedPrize = ethers.parseEther("10");
    } else {
      expectedPrize = ethers.parseEther("100");
    }

    // Ищем настоящее событие PrizePaid в логах транзакции.
    const prizePaidEvent = successfulReceipt!.logs
      .map(log => {
        try {
          return harness.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(event => event?.name === "PrizePaid");

    expect(prizePaidEvent).not.to.equal(undefined);
    expect(prizePaidEvent!.args.player).to.equal(alice.address);
    expect(prizePaidEvent!.args.amount).to.equal(expectedPrize);
    expect(prizePaidEvent!.args.matches).to.equal(BigInt(actualMatches));

    // Проверяем, что контракт записал победу.
    expect(await harness.getWins(alice.address)).to.equal(1n);
  });
});
