"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import { motion } from "framer-motion";
import type { NextPage } from "next";
import Confetti from "react-confetti";
import CountUp from "react-countup";
import toast, { Toaster } from "react-hot-toast";
import { useAccount, useBalance } from "wagmi";
import { HypeBadges, JackpotCounter, OnlineCounter, WinnersTicker } from "~~/components/FakeHype";
import { LotteryBackground } from "~~/components/LotteryBackground";
import { BarrelIcon, PeopleIcon, RoundIcon, TicketIcon, TrophyIcon } from "~~/components/LotteryIcons";
import {
  useScaffoldReadContract,
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";

const BOTS = [
  { name: "Алексей", addr: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", numbers: [3, 12, 18, 25, 33, 41], prize: 0 },
  { name: "Мария", addr: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c", numbers: [7, 14, 21, 28, 35, 42], prize: 1 },
  { name: "Дмитрий", addr: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d", numbers: [1, 9, 17, 26, 34, 43], prize: 0 },
  { name: "Ольга", addr: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e", numbers: [5, 11, 22, 29, 37, 48], prize: 10 },
  { name: "Сергей", addr: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f", numbers: [2, 13, 19, 31, 39, 47], prize: 0 },
];

const shortAddr = (a: string) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "");

type PrizeEvent = {
  player: string;
  amount: bigint;
  matches: number;
  round: bigint;
  txHash: string;
};

type MyTicket = {
  player: string;
  numbers: readonly bigint[];
  round: bigint;
  prize: bigint;
};

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: balance } = useBalance({ address: connectedAddress });

  // READ
  const { data: owner } = useScaffoldReadContract({ contractName: "Lotto", functionName: "owner" });
  const { data: ticketsCount } = useScaffoldReadContract({
    contractName: "Lotto",
    functionName: "getTicketsCount",
  });
  const { data: lastDraw } = useScaffoldReadContract({
    contractName: "Lotto",
    functionName: "getLastDraw",
    watch: true,
  });
  const { data: myPrize } = useScaffoldReadContract({
    contractName: "Lotto",
    functionName: "getMyPrize",
  });
  const { data: myTicketsRaw } = useScaffoldReadContract({
    contractName: "Lotto",
    functionName: "getMyTickets",
    watch: true,
  });

  const isOwner = useMemo(
    () => !!connectedAddress && !!owner && connectedAddress.toLowerCase() === (owner as string).toLowerCase(),
    [connectedAddress, owner],
  );

  // WRITE
  const { writeContractAsync: buyTicket, isPending: isBuying } = useScaffoldWriteContract({ contractName: "Lotto" });
  const { writeContractAsync: drawNumbers, isPending: isDrawing } = useScaffoldWriteContract({ contractName: "Lotto" });
  const { writeContractAsync: resetRound, isPending: isResetting } = useScaffoldWriteContract({
    contractName: "Lotto",
  });

  const [showConfetti, setShowConfetti] = useState(false);

  async function onBuy() {
    try {
      await buyTicket({
        functionName: "buyTicket",
        value: BigInt("1000000000000000000"), // 1 ETH
      });
      toast.success("Билет куплен! Ваши числа — ниже.", { icon: "🎟" });
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Ошибка покупки билета");
    }
  }

  async function onDraw() {
    try {
      await drawNumbers({ functionName: "drawNumbers" });
      toast.success("Числа разыграны!", { icon: "🎲" });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Ошибка розыгрыша");
    }
  }

  async function onReset() {
    try {
      await resetRound({ functionName: "resetRound" });
      toast.success("Раунд сброшен.");
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Ошибка сброса раунда");
    }
  }

  const [events, setEvents] = useState<PrizeEvent[]>([]);
  useScaffoldWatchContractEvent({
    contractName: "Lotto",
    eventName: "PrizePaid",
    onLogs: logs => {
      logs.forEach(log => {
        const { player, amount, matches, round } = log.args as {
          player: string;
          amount: bigint;
          matches: number;
          round: bigint;
        };
        setEvents(prev => [{ player, amount, matches, round, txHash: log.transactionHash ?? "" }, ...prev]);
      });
    },
  });

  const drawn = (lastDraw as readonly number[] | undefined) ?? [];
  const prize = Number(myPrize ?? 0) / 1e18;
  const myTickets = (myTicketsRaw as unknown as MyTicket[] | undefined) ?? [];

  return (
    <div className="min-h-screen relative">
      <LotteryBackground />
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={200}
          gravity={0.15}
          colors={["#FFD700", "#FFA500", "#FF0080", "#00E5FF", "#8B0000"]}
        />
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1a0033", color: "#FFD700", border: "2px solid #FFD700", fontWeight: "bold" },
        }}
      />

      <header className="relative bg-black/30 backdrop-blur-md border-b border-yellow-500/30">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 border-2 border-yellow-200">
              <BarrelIcon className="w-7 h-7 text-red-900" />
            </div>
            <div>
              <h1 className="text-2xl font-black shimmer-text">ЛУТКА-МУТКА</h1>
              <p className="text-xs text-yellow-200/70 uppercase tracking-widest">Лото 6 из 49</p>
            </div>
          </motion.div>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Address address={connectedAddress} chain={targetNetwork} />
            {isOwner && (
              <span className="px-3 py-1 rounded-full bg-yellow-400 text-red-900 text-xs font-black uppercase border-2 border-yellow-200">
                Владелец
              </span>
            )}
          </motion.div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-12">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HypeBadges />
        </motion.div>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 text-xs font-bold uppercase tracking-widest mb-4">
            Учебный проект · призы виртуальные
          </div>
          <h2 className="text-5xl sm:text-7xl font-black text-white mb-4 leading-none drop-shadow-2xl">
            ЛОТО <span className="shimmer-text">6 ИЗ 49</span>
          </h2>
          <p className="text-yellow-100/80 text-xl max-w-2xl mx-auto mb-4">
            Купи билет за 1 ETH — и, возможно, твои числа сорвут джекпот.
          </p>
          <div className="flex justify-center mb-4">
            <OnlineCounter />
          </div>
        </motion.div>

        {/* Баланс */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/40 backdrop-blur-md">
            <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Ваш баланс ETH</p>
            <p className="text-4xl font-black text-white">
              {balance ? (Number(balance.value) / 1e18).toFixed(4) : "0"} ETH
            </p>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/40 backdrop-blur-md">
            <p className="text-emerald-200 text-xs uppercase tracking-widest mb-1">Ваш выигрыш</p>
            <p className="text-4xl font-black text-white">
              <CountUp end={prize} decimals={4} duration={1.5} /> ETH
            </p>
          </div>
        </motion.div>

        {/* Джекпот + Лента */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            className="rounded-3xl p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 backdrop-blur-md shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <JackpotCounter />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <WinnersTicker />
          </motion.div>
        </div>

        {/* Последние числа */}
        <motion.div
          className="rounded-3xl p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-400/50 backdrop-blur-md shadow-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
            <TrophyIcon className="w-6 h-6 text-yellow-400" />
            Последние выпавшие числа
          </h3>
          {drawn.length === 0 || drawn.every(n => Number(n) === 0) ? (
            <p className="text-white/60 text-center py-4">Розыгрыш ещё не проводился</p>
          ) : (
            <div className="flex justify-center gap-3 flex-wrap">
              {drawn.map((n, i) => (
                <motion.div
                  key={i}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center text-red-900 text-2xl font-black shadow-lg border-2 border-yellow-200"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                >
                  {Number(n)}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Мои билеты */}
        <motion.div
          className="rounded-3xl p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400/50 backdrop-blur-md shadow-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
            <TicketIcon className="w-6 h-6 text-indigo-400" />
            Мои билеты
          </h3>
          {myTickets.length === 0 ? (
            <p className="text-white/60 text-center py-4">У вас ещё нет билетов. Купите билет, чтобы участвовать!</p>
          ) : (
            <div className="space-y-4">
              {myTickets.map((t, idx) => (
                <motion.div
                  key={idx}
                  className="rounded-xl p-4 bg-white/5 border border-indigo-400/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <p className="text-xs text-indigo-300 uppercase mb-2">
                    Билет #{idx + 1} · раунд #{Number(t.round)}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(t.numbers as readonly bigint[]).map((n, j) => (
                      <div
                        key={j}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center text-red-900 text-lg font-black shadow border-2 border-yellow-200"
                      >
                        {Number(n)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Действия */}
        <motion.div
          className="rounded-3xl p-6 bg-black/30 backdrop-blur-md border-2 border-yellow-500/30 mb-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
            <TicketIcon className="w-6 h-6 text-yellow-400" />
            Действия
          </h3>
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={onBuy}
              disabled={isBuying}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-red-900 font-black text-lg shadow-lg shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isBuying ? 1 : 1.05, boxShadow: "0 0 30px rgba(255,215,0,0.8)" }}
              whileTap={{ scale: isBuying ? 1 : 0.95 }}
            >
              <TicketIcon className="w-5 h-5" />
              {isBuying ? "Подтвердите..." : "КУПИТЬ БИЛЕТ (1 ETH)"}
            </motion.button>
            <motion.button
              onClick={onDraw}
              disabled={!isOwner || isDrawing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: !isOwner || isDrawing ? 1 : 1.05 }}
              whileTap={{ scale: !isOwner || isDrawing ? 1 : 0.95 }}
            >
              <TrophyIcon className="w-5 h-5" />
              {isDrawing ? "Подтвердите..." : isOwner ? "РАЗЫГРАТЬ ЧИСЛА" : "ТОЛЬКО ВЛАДЕЛЕЦ"}
            </motion.button>
            <motion.button
              onClick={onReset}
              disabled={!isOwner || isResetting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold border-2 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: !isOwner || isResetting ? 1 : 1.05 }}
              whileTap={{ scale: !isOwner || isResetting ? 1 : 0.95 }}
            >
              <RoundIcon className="w-5 h-5" />
              {isResetting ? "Подтвердите..." : "СБРОСИТЬ РАУНД"}
            </motion.button>
          </div>
        </motion.div>

        {/* Участники — реальные + боты */}
        <motion.div
          className="rounded-3xl p-6 bg-black/30 backdrop-blur-md border-2 border-purple-500/30 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
            <PeopleIcon className="w-6 h-6 text-purple-400" />
            Участники
            <span className="ml-auto px-3 py-1 rounded-full bg-purple-500 text-white text-sm">
              {Number(ticketsCount ?? 0) + BOTS.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BOTS.map((bot, i) => (
              <motion.div
                key={bot.addr}
                className="rounded-xl p-4 bg-gradient-to-br from-purple-400/10 to-pink-400/10 border border-purple-400/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-black text-sm">
                    {bot.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{bot.name}</p>
                    <p className="font-mono text-xs text-white/50">{shortAddr(bot.addr)}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {bot.numbers.map((n, j) => (
                    <span
                      key={j}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center text-red-900 text-xs font-black"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                {bot.prize > 0 && <p className="text-xs text-yellow-400 font-bold mt-2">Выиграл: +{bot.prize} ETH</p>}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* История */}
        <motion.div
          className="rounded-3xl p-6 bg-black/30 backdrop-blur-md border-2 border-amber-500/30 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
            <TrophyIcon className="w-6 h-6 text-amber-400" />
            История выигрышей
            <span className="ml-auto px-3 py-1 rounded-full bg-amber-500 text-white text-sm">{events.length}</span>
          </h3>
          {events.length === 0 ? (
            <p className="text-white/60 text-center py-6">Пока нет выигрышей.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((ev, i) => (
                <motion.li
                  key={`${ev.txHash}-${i}`}
                  className="rounded-xl p-3 bg-gradient-to-r from-amber-400/10 to-orange-500/10 border border-amber-400/30 flex justify-between items-center flex-wrap gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div>
                    <p className="text-white font-mono text-sm">{shortAddr(ev.player)}</p>
                    <p className="text-xs text-yellow-200/60">
                      Раунд #{ev.round.toString()} · совпадений: {ev.matches.toString()}
                    </p>
                  </div>
                  <p className="font-black shimmer-text text-xl">+{(Number(ev.amount) / 1e18).toFixed(2)} ETH</p>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/debug"
            className="block p-5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 hover:border-yellow-400/50 transition-colors"
          >
            <h3 className="font-bold text-white mb-1">Debug Contracts</h3>
            <p className="text-sm text-white/60">Экспериментируйте с контрактом.</p>
          </Link>
          <Link
            href="/blockexplorer"
            className="block p-5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 hover:border-yellow-400/50 transition-colors"
          >
            <h3 className="font-bold text-white mb-1">Block Explorer</h3>
            <p className="text-sm text-white/60">Транзакции локальной сети.</p>
          </Link>
        </div>
      </main>

      <footer className="relative text-center py-6 text-sm text-white/50">
        Лутка-мутка — учебный проект. Все призы виртуальные. Не является азартной игрой.
      </footer>
    </div>
  );
};

export default Home;
