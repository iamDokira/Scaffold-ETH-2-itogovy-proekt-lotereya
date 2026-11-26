"use client";

import { useEffect, useState } from "react";

type FloatingItem = {
  id: number;
  type: "barrel" | "star" | "coin";
  number: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

const generateItems = (): FloatingItem[] => {
  const items: FloatingItem[] = [];
  for (let i = 0; i < 20; i++) {
    items.push({
      id: i,
      type: i % 4 === 0 ? "barrel" : i % 4 === 1 ? "star" : "coin",
      number: Math.floor(Math.random() * 90) + 1,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 18 + Math.random() * 20,
      size: 20 + Math.random() * 40,
    });
  }
  return items;
};

export function LotteryBackground() {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    setItems(generateItems());
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg) scale(1.2);
            opacity: 0;
          }
        }
        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(255, 215, 0, 1));
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .float-item {
          animation: float-up linear infinite;
          position: absolute;
          bottom: -120px;
        }
        .glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFA500 75%, #FFD700 100%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0033] via-[#4a0044] to-[#8B0000]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,0,100,0.15),transparent_50%)]" />

      {items.map(item => (
        <div
          key={item.id}
          className="float-item"
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {item.type === "barrel" && (
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 64 64"
              fill="none"
              className="glow-pulse"
              style={{ opacity: 0.7 }}
            >
              <ellipse cx="32" cy="32" rx="18" ry="22" fill="#F5DEB3" stroke="#FFD700" strokeWidth="2" />
              <path d="M14 22 Q32 18 50 22" stroke="#8B5A2B" strokeWidth="1.5" fill="none" />
              <path d="M14 42 Q32 46 50 42" stroke="#8B5A2B" strokeWidth="1.5" fill="none" />
              <ellipse cx="32" cy="32" rx="9" ry="10" fill="#FFE4B5" stroke="#8B5A2B" strokeWidth="1.5" />
              <text
                x="32"
                y="36"
                textAnchor="middle"
                fontSize="11"
                fontWeight="900"
                fill="#8B0000"
                fontFamily="Arial Black"
              >
                {item.number}
              </text>
            </svg>
          )}
          {item.type === "star" && (
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 24 24"
              fill="#FFD700"
              className="glow-pulse"
              style={{ opacity: 0.6 }}
            >
              <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
            </svg>
          )}
          {item.type === "coin" && (
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 24 24"
              fill="none"
              className="glow-pulse"
              style={{ opacity: 0.5 }}
            >
              <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill="#8B0000"
                fontFamily="Arial Black"
              >
                $
              </text>
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
