"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BarrelIcon, PeopleIcon, RoundIcon, TicketIcon, TrophyIcon } from "~~/components/LotteryIcons";
import {
  useScaffoldReadContract,
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";

type WinnerEvent = {
  winner: string;
  prize: bigint;
  round: bigint;
  totalPlayers: bigint;
  txHash: string;
  blockNumber: bigint;
};

const shortAddr = (a: string) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "");

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: owner } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "owner",
  });

  const { data: players, refetch: refetchPlayers } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "getPlayers",
    watch: true,
  });

  const { data: winnerData, refetch: refetchWinner } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "getWinner",
    watch: true,
  });

  const isOwner = useMemo(
    () => !!connectedAddress && !!owner && connectedAddress.toLowerCase() === (owner as string).toLowerCase(),
    [connectedAddress, owner],
  );

  const { writeContractAsync: buyTicket, isPending: isBuying } = useScaffoldWriteContract({
    contractName: "Lottery",
  });

  const { writeContractAsync: pickWinner, isPending: isPicking } = useScaffoldWriteContract({
    contractName: "Lottery",
  });

  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function onBuy() {
    try {
      setErrMsg(null);
      setSuccessMsg(null);
      await buyTicket({ functionName: "buyTicket" });
      setSuccessMsg("Билет куплен! Вы в списке участников.");
      refetchPlayers?.();
    } catch (e: any) {
      setErrMsg(e?.shortMessage || e?.message || "Ошибка покупки билета");
    }
  }

  async function onPick() {
    try {
      setErrMsg(null);
      setSuccessMsg(null);
      await pickWinner({ functionName: "pickWinner" });
      setSuccessMsg("Победитель выбран! Смотрите историю ниже.");
      refetchPlayers?.();
      refetchWinner?.();
    } catch (e: any) {
      setErrMsg(e?.shortMessage || e?.message || "Ошибка выбора победителя");
    }
  }

  const [events, setEvents] = useState<WinnerEvent[]>([]);
  useScaffoldWatchContractEvent({
    contractName: "Lottery",
    eventName: "WinnerPicked",
    onLogs: logs => {
      logs.forEach(log => {
        const { winner, prize, round, totalPlayers } = log.args as {
          winner: string;
          prize: bigint;
          round: bigint;
          totalPlayers: bigint;
        };
        setEvents(prev => [
          {
            winner,
            prize,
            round,
            totalPlayers,
            txHash: log.transactionHash ?? "",
            blockNumber: log.blockNumber ?? 0n,
          },
          ...prev,
        ]);
      });
    },
  });

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 5000);
    return () => clearTimeout(t);
  }, [successMsg]);

  useEffect(() => {
    if (!errMsg) return;
    const t = setTimeout(() => setErrMsg(null), 8000);
    return () => clearTimeout(t);
  }, [errMsg]);

  const [winnerAddr, winnerRound] = (winnerData as [string, bigint] | undefined) ?? ["", 0n];
  const playersArr = (players as string[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-red-900 font-sans" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
      {/* Шапка */}
      <header className="bg-red-900 border-b-4 border-yellow-400 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
              <BarrelIcon className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-yellow-400 tracking-tight">Лутка-мутка</h1>
              <p className="text-yellow-200 text-sm mt-1">Лотерея на блокчейне</p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <Address
              address={connectedAddress}
              chain={targetNetwork}
              blockExplorerAddressLink={
                targetNetwork.id === hardhat.id ? `/blockexplorer/address/${connectedAddress}` : undefined
              }
            />
            {isOwner && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-red-900 text-xs font-bold uppercase">
                <span className="w-2 h-2 rounded-full bg-red-900" />
                Владелец
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero-баннер */}
      <section className="bg-gradient-to-b from-red-900 to-red-800 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            Купи билет — <span className="text-yellow-400">испытай удачу!</span>
          </h2>
          <p className="text-yellow-100 text-lg max-w-2xl mx-auto">
            Каждый билет — шанс выиграть приз. Победитель выбирается честно, а результат записывается в блокчейн.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <StatCard
            icon={<RoundIcon className="w-12 h-12" />}
            label="Текущий раунд"
            value={`#${winnerRound.toString()}`}
            hint="После выбора победителя начинается новый"
          />
          <StatCard
            icon={<PeopleIcon className="w-12 h-12" />}
            label="Участники"
            value={playersArr.length.toString()}
            hint="Купили билет в этом раунде"
          />
          <StatCard
            icon={<TrophyIcon className="w-12 h-12" />}
            label="Победитель"
            value={winnerAddr ? shortAddr(winnerAddr) : "—"}
            hint={winnerAddr ? `Раунд #${winnerRound.toString()}` : "Ещё не выбран"}
          />
        </div>

        {/* Действия */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-400 mb-10">
          <h3 className="text-2xl font-black text-red-900 mb-6 flex items-center gap-3">
            <TicketIcon className="w-8 h-8" />
            Купить билет
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onBuy}
              disabled={isBuying}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-lg shadow-lg shadow-yellow-500/50 hover:shadow-yellow-400/70 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-yellow-500"
            >
              <BarrelIcon className="w-7 h-7" />
              {isBuying ? "Подтвердите в MetaMask..." : "Купить билет"}
            </button>

            <button
              onClick={onPick}
              disabled={!isOwner || isPicking}
              title={!isOwner ? "Только владелец может выбрать победителя" : ""}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black text-lg shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed border-2 border-red-900"
            >
              <TrophyIcon className="w-7 h-7" />
              {isPicking ? "Подтвердите в MetaMask..." : isOwner ? "Выбрать победителя" : "Только владелец"}
            </button>
          </div>

          {errMsg && (
            <div className="mt-5 p-4 rounded-xl bg-red-100 border-l-4 border-red-600 text-red-900 text-sm font-semibold">
              {errMsg}
            </div>
          )}
          {successMsg && (
            <div className="mt-5 p-4 rounded-xl bg-green-100 border-l-4 border-green-600 text-green-900 text-sm font-semibold">
              {successMsg}
            </div>
          )}

          <p className="mt-4 text-sm text-red-800/70">
            Покупка билета и выбор победителя — транзакции с подтверждением в MetaMask.
          </p>
        </section>

        {/* Участники */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-400 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-red-900 flex items-center gap-3">
              <PeopleIcon className="w-8 h-8" />
              Участники текущего раунда
            </h3>
            <span className="px-4 py-1 rounded-full bg-red-900 text-yellow-400 text-sm font-bold">
              {playersArr.length}
            </span>
          </div>
          {playersArr.length === 0 ? (
            <p className="text-red-900/60 text-center py-8 font-semibold">Пока нет участников. Станьте первым!</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playersArr.map((p, i) => (
                <li key={p} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border-2 border-yellow-300">
                  <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center text-yellow-400 font-black">
                    {i + 1}
                  </div>
                  <span className="font-mono text-sm text-red-900 font-bold">{shortAddr(p)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* История */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-400 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-red-900 flex items-center gap-3">
              <TrophyIcon className="w-8 h-8" />
              История розыгрышей
            </h3>
            <span className="px-4 py-1 rounded-full bg-red-900 text-yellow-400 text-sm font-bold">{events.length}</span>
          </div>
          {events.length === 0 ? (
            <p className="text-red-900/60 text-center py-8 font-semibold">Пока нет розыгрышей</p>
          ) : (
            <ul className="space-y-3">
              {events.map((ev, i) => (
                <li key={`${ev.txHash}-${i}`} className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center flex-shrink-0">
                        <TrophyIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-red-900 font-black">
                          Раунд <span className="text-red-700">#{ev.round.toString()}</span>
                        </p>
                        <p className="text-sm text-red-900/70 mt-1 font-semibold">
                          Победитель: <span className="font-mono text-red-900">{shortAddr(ev.winner)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-700 font-black text-xl">+{ev.prize.toString()}</p>
                      <p className="text-xs text-red-900/60">{ev.totalPlayers.toString()} уч.</p>
                    </div>
                  </div>
                  <p className="text-xs text-red-900/40 mt-3 font-mono">
                    Блок #{ev.blockNumber.toString()} · {ev.txHash.slice(0, 10)}...
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/debug"
            className="p-6 rounded-2xl bg-white border-4 border-yellow-400 hover:bg-yellow-50 transition-colors"
          >
            <h3 className="text-red-900 font-black mb-2 text-lg">Debug Contracts</h3>
            <p className="text-sm text-red-900/70 font-semibold">Поэкспериментируйте со смарт-контрактом напрямую.</p>
          </Link>
          <Link
            href="/blockexplorer"
            className="p-6 rounded-2xl bg-white border-4 border-yellow-400 hover:bg-yellow-50 transition-colors"
          >
            <h3 className="text-red-900 font-black mb-2 text-lg">Block Explorer</h3>
            <p className="text-sm text-red-900/70 font-semibold">Посмотрите локальные транзакции.</p>
          </Link>
        </div>
      </main>

      {/* Подвал */}
      <footer className="bg-red-950 text-yellow-200 text-center py-6 mt-10 border-t-4 border-yellow-400">
        <p className="text-sm font-semibold">
          © Лутка-мутка — учебный проект по дисциплине «Основы технологии блокчейн»
        </p>
      </footer>
    </div>
  );
};

// Вспомогательный компонент карточки
function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl border-4 border-yellow-400">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">{icon}</div>
        <p className="text-red-900 font-bold text-sm uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-3xl font-black text-red-900">{value}</p>
      <p className="text-sm text-red-900/60 mt-2 font-semibold">{hint}</p>
    </div>
  );
}

export default Home;
