"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ===== Джекпот, тикает каждые 3 сек =====
export function JackpotCounter() {
  const [jackpot, setJackpot] = useState(1247893);

  useEffect(() => {
    const t = setInterval(() => {
      setJackpot(prev => prev + Math.floor(Math.random() * 47) + 3);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="text-center">
      <p className="text-yellow-300 text-xs uppercase tracking-widest mb-1">Джекпот растёт</p>
      <motion.p
        key={jackpot}
        className="text-6xl font-black shimmer-text"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {jackpot.toLocaleString("ru-RU")} $
      </motion.p>
      <p className="text-yellow-200/60 text-xs mt-1">обновляется каждые 3 сек</p>
    </div>
  );
}

// ===== Лента «только что выиграл...» (фейк, каждые 8 сек) =====
const FAKE_NAMES = ["Алексей", "Мария", "Дмитрий", "Ольга", "Сергей", "Анна", "Иван", "Екатерина", "Павел", "Наталья"];
const FAKE_CITIES = ["Москва", "СПб", "Казань", "Новосибирск", "Екатеринбург", "Самара", "Омск", "Челябинск"];
const FAKE_AMOUNTS = [100, 250, 500, 1000, 2500, 5000, 10000, 50000];

function randomWinner() {
  return {
    name: FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)],
    city: FAKE_CITIES[Math.floor(Math.random() * FAKE_CITIES.length)],
    amount: FAKE_AMOUNTS[Math.floor(Math.random() * FAKE_AMOUNTS.length)],
  };
}

export function WinnersTicker() {
  const [winners, setWinners] = useState<ReturnType<typeof randomWinner>[]>([]);

  useEffect(() => {
    setWinners([randomWinner(), randomWinner(), randomWinner()]);
    const t = setInterval(() => {
      setWinners(prev => [randomWinner(), ...prev.slice(0, 2)]);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-orange-400/50 backdrop-blur-md">
      <p className="text-orange-200 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Только что выиграли
      </p>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {winners.map((w, i) => (
            <motion.div
              key={`${w.name}-${w.amount}-${i}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-black/30"
            >
              <span className="text-white">
                <span className="font-bold">{w.name}</span> <span className="text-white/50 text-xs">({w.city})</span>
              </span>
              <span className="font-black text-yellow-400">+{w.amount.toLocaleString("ru-RU")} $</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ===== «Игроков онлайн» (тикает каждые 6 сек) =====
export function OnlineCounter() {
  const [online, setOnline] = useState(1247);

  useEffect(() => {
    const t = setInterval(() => {
      setOnline(prev => Math.max(1000, prev + Math.floor(Math.random() * 21) - 10));
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/50 text-green-300 text-xs font-bold">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      {online.toLocaleString("ru-RU")} игроков онлайн
    </span>
  );
}

// ===== Баннер «первый билет бесплатно» =====
export function FreeTicketBanner() {
  return (
    <motion.div
      className="rounded-2xl p-5 bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-yellow-200 shadow-2xl shadow-yellow-500/50"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-900 flex items-center justify-center text-yellow-400 text-2xl font-black border-2 border-yellow-200">
          1
        </div>
        <div className="flex-1">
          <p className="text-red-900 font-black text-lg uppercase">Первый билет — 1 ETH!</p>
          <p className="text-red-900/70 text-sm">Каждый билет стоит 1 ETH. Победители получают до 100 ETH.</p>
        </div>
        <span className="text-3xl">🎁</span>
      </div>
    </motion.div>
  );
}

// ===== Бейджи =====
export function HypeBadges() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <span className="px-3 py-1.5 rounded-full bg-red-500/20 border-2 border-red-400/50 text-red-300 text-xs font-black uppercase animate-pulse">
        100% выигрыш
      </span>
      <span className="px-3 py-1.5 rounded-full bg-orange-500/20 border-2 border-orange-400/50 text-orange-300 text-xs font-black uppercase">
        Хит недели
      </span>
      <span className="px-3 py-1.5 rounded-full bg-yellow-500/20 border-2 border-yellow-400/50 text-yellow-300 text-xs font-black uppercase">
        Только сегодня
      </span>
      <span className="px-3 py-1.5 rounded-full bg-purple-500/20 border-2 border-purple-400/50 text-purple-300 text-xs font-black uppercase">
        +10 к удаче
      </span>
      <span className="px-3 py-1.5 rounded-full bg-green-500/20 border-2 border-green-400/50 text-green-300 text-xs font-black uppercase">
        Бонус новичкам
      </span>
    </div>
  );
}
