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
    <div
      className="min-h-screen font-sans"
      style={{
        fontFamily: "'Arial Black', 'Segoe UI', Arial, sans-serif",
        background: "linear-gradient(180deg, #8B0000 0%, #A00000 40%, #6B0000 100%)",
      }}
    >
      {/* Шапка с текстурой */}
      <header
        className="relative border-b-8 border-yellow-400 shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #A00000 0%, #8B0000 100%)",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.05) 0%, transparent 50%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50 border-4 border-yellow-200">
                <BarrelIcon className="w-14 h-14" number={7} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-900 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 text-xs font-black">
                ★
              </div>
            </div>
            <div>
              <h1
                className="text-4xl sm:text-5xl font-black tracking-tight"
                style={{
                  color: "#FFD700",
                  textShadow: "3px 3px 0 #8B0000, -1px -1px 0 #FFA500",
                  WebkitTextStroke: "1px #8B0000",
                }}
              >
                ЛУТКА-МУТКА
              </h1>
              <p className="text-yellow-200 text-sm mt-1 font-bold uppercase tracking-widest">
                Блокчейн-лотерея · Играй и выигрывай
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <Address
              address={connectedAddress}
              chain={targetNetwork}
              blockExplorerAddressLink={
                targetNetwork.id === hardhat.id ? `/blockexplorer/address/${connectedAddress}` : undefined
              }
            />
            {isOwner && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-red-900 text-xs font-black uppercase border-2 border-red-900">
                <span className="w-2 h-2 rounded-full bg-red-900 animate-pulse" />
                Владелец
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero-баннер */}
      <section
        className="py-14 px-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #8B0000 0%, #A00000 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2
            className="text-4xl sm:text-6xl font-black text-white leading-tight mb-4"
            style={{ textShadow: "4px 4px 0 #8B0000" }}
          >
            КУПИ БИЛЕТ — <span className="text-yellow-400">ИСПЫТАЙ УДАЧУ!</span>
          </h2>
          <p className="text-yellow-100 text-lg max-w-2xl mx-auto font-semibold">
            Каждый билет — шанс выиграть приз. Победитель выбирается честно, а результат записывается в блокчейн — никто
            не сможет подделать итог.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <div className="px-4 py-2 rounded-full bg-yellow-400/10 border-2 border-yellow-400/30 text-yellow-200 text-sm font-bold">
              🎯 Раунд #{winnerRound.toString()}
            </div>
            <div className="px-4 py-2 rounded-full bg-yellow-400/10 border-2 border-yellow-400/30 text-yellow-200 text-sm font-bold">
              👥 {playersArr.length} участников
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <StatCard
            icon={<RoundIcon className="w-14 h-14" />}
            label="Текущий раунд"
            value={`#${winnerRound.toString()}`}
            hint="После выбора победителя начинается новый"
            accent="border-blue-400"
          />
          <StatCard
            icon={<PeopleIcon className="w-14 h-14" />}
            label="Участники"
            value={playersArr.length.toString()}
            hint="Купили билет в этом раунде"
            accent="border-purple-400"
          />
          <StatCard
            icon={<TrophyIcon className="w-14 h-14" />}
            label="Победитель"
            value={winnerAddr ? shortAddr(winnerAddr) : "—"}
            hint={winnerAddr ? `Раунд #${winnerRound.toString()}` : "Ещё не выбран"}
            accent="border-yellow-400"
          />
        </div>

        {/* Действия */}
        <section
          className="rounded-2xl p-6 sm:p-8 shadow-2xl mb-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)",
            border: "6px solid #FFD700",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4), inset 0 0 30px rgba(255,215,0,0.1)",
          }}
        >
          {/* Уголки-украшения */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-red-900" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-red-900" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-red-900" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-red-900" />

          <h3 className="text-3xl font-black text-red-900 mb-6 flex items-center gap-3">
            <TicketIcon className="w-10 h-10" />
            Купить билет
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onBuy}
              disabled={isBuying}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-xl font-black text-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 border-4"
              style={{
                background: "linear-gradient(180deg, #FFD700 0%, #FFA500 100%)",
                borderColor: "#8B0000",
                color: "#8B0000",
                textShadow: "1px 1px 0 rgba(255,255,255,0.5)",
                boxShadow: "0 8px 0 #8B0000, 0 12px 20px rgba(0,0,0,0.3)",
              }}
            >
              <BarrelIcon className="w-8 h-8" number={7} />
              {isBuying ? "Подтвердите в MetaMask..." : "КУПИТЬ БИЛЕТ"}
            </button>

            <button
              onClick={onPick}
              disabled={!isOwner || isPicking}
              title={!isOwner ? "Только владелец может выбрать победителя" : ""}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-black text-xl shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed border-4"
              style={{
                background: "linear-gradient(180deg, #A00000 0%, #8B0000 100%)",
                borderColor: "#FFD700",
                color: "#FFD700",
                boxShadow: "0 8px 0 #5C0000, 0 12px 20px rgba(0,0,0,0.3)",
              }}
            >
              <TrophyIcon className="w-8 h-8" />
              {isPicking ? "Подтвердите в MetaMask..." : isOwner ? "ВЫБРАТЬ ПОБЕДИТЕЛЯ" : "ТОЛЬКО ВЛАДЕЛЕЦ"}
            </button>
          </div>

          {errMsg && (
            <div className="mt-5 p-4 rounded-xl bg-red-100 border-l-8 border-red-700 text-red-900 text-sm font-bold shadow">
              ⚠ {errMsg}
            </div>
          )}
          {successMsg && (
            <div className="mt-5 p-4 rounded-xl bg-green-100 border-l-8 border-green-700 text-green-900 text-sm font-bold shadow">
              ✓ {successMsg}
            </div>
          )}

          <p className="mt-4 text-sm text-red-900/70 font-semibold">
            Покупка билета и выбор победителя — транзакции с подтверждением в MetaMask.
          </p>
        </section>

        {/* Участники — как лотерейные бочонки */}
        <section
          className="rounded-2xl p-6 sm:p-8 shadow-2xl mb-10 relative"
          style={{
            background: "linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)",
            border: "6px solid #FFD700",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-black text-red-900 flex items-center gap-3">
              <PeopleIcon className="w-10 h-10" />
              Участники раунда
            </h3>
            <span className="px-4 py-2 rounded-full bg-red-900 text-yellow-400 text-lg font-black border-4 border-yellow-400">
              {playersArr.length}
            </span>
          </div>
          {playersArr.length === 0 ? (
            <p className="text-red-900/60 text-center py-10 font-bold text-lg">Пока нет участников. Станьте первым!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {playersArr.map((p, i) => (
                <div
                  key={p}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-transform hover:scale-105"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8DC 100%)",
                    border: "3px solid #8B0000",
                    boxShadow: "0 4px 0 #8B0000, 0 6px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <BarrelIcon className="w-16 h-16" number={i + 1} />
                  <span className="font-mono text-xs text-red-900 font-bold">{shortAddr(p)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* История розыгрышей */}
        <section
          className="rounded-2xl p-6 sm:p-8 shadow-2xl mb-10"
          style={{
            background: "linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)",
            border: "6px solid #FFD700",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-black text-red-900 flex items-center gap-3">
              <TrophyIcon className="w-10 h-10" />
              История розыгрышей
            </h3>
            <span className="px-4 py-2 rounded-full bg-red-900 text-yellow-400 text-lg font-black border-4 border-yellow-400">
              {events.length}
            </span>
          </div>
          {events.length === 0 ? (
            <p className="text-red-900/60 text-center py-10 font-bold text-lg">Пока нет розыгрышей</p>
          ) : (
            <ul className="space-y-3">
              {events.map((ev, i) => (
                <li
                  key={`${ev.txHash}-${i}`}
                  className="p-4 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%)",
                    border: "3px solid #8B0000",
                    boxShadow: "0 4px 0 #8B0000",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                      <BarrelIcon className="w-12 h-12 flex-shrink-0" number={Number(ev.round)} />
                      <div>
                        <p className="text-red-900 font-black text-lg">
                          Раунд <span className="text-red-700">#{ev.round.toString()}</span>
                        </p>
                        <p className="text-sm text-red-900/70 mt-1 font-bold">
                          Победитель: <span className="font-mono text-red-900">{shortAddr(ev.winner)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl" style={{ color: "#8B0000", textShadow: "1px 1px 0 #FFD700" }}>
                        +{ev.prize.toString()}
                      </p>
                      <p className="text-xs text-red-900/60 font-bold">{ev.totalPlayers.toString()} участников</p>
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
            className="p-6 rounded-2xl transition-transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)",
              border: "4px solid #FFD700",
            }}
          >
            <h3 className="text-red-900 font-black mb-2 text-xl">Debug Contracts</h3>
            <p className="text-sm text-red-900/70 font-semibold">Поэкспериментируйте со смарт-контрактом напрямую.</p>
          </Link>
          <Link
            href="/blockexplorer"
            className="p-6 rounded-2xl transition-transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)",
              border: "4px solid #FFD700",
            }}
          >
            <h3 className="text-red-900 font-black mb-2 text-xl">Block Explorer</h3>
            <p className="text-sm text-red-900/70 font-semibold">Посмотрите локальные транзакции.</p>
          </Link>
        </div>
      </main>

      {/* Подвал */}
      <footer className="text-center py-8 mt-10 border-t-8 border-yellow-400" style={{ background: "#5C0000" }}>
        <p className="text-yellow-200 text-sm font-bold">
          © ЛУТКА-МУТКА — учебный проект по дисциплине «Основы технологии блокчейн»
        </p>
        <p className="text-yellow-200/50 text-xs mt-1">Не является азартной игрой. Все призы — виртуальные.</p>
      </footer>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-2xl ${accent}`}
      style={{
        background: "linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)",
        border: "6px solid #FFD700",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3), 0 4px 0 #8B0000",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center border-3 border-red-900">
          {icon}
        </div>
        <p className="text-red-900 font-black text-sm uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-4xl font-black" style={{ color: "#8B0000", textShadow: "1px 1px 0 #FFD700" }}>
        {value}
      </p>
      <p className="text-sm text-red-900/70 mt-2 font-bold">{hint}</p>
    </div>
  );
}

export default Home;
