// Простые SVG-иконки (lucide-react для минимализма)
import { CircleDot, Clock, Ticket, Trophy, Users } from "lucide-react";

export function BarrelIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <CircleDot className={className} />;
}

export function TicketIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Ticket className={className} />;
}

export function TrophyIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Trophy className={className} />;
}

export function PeopleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Users className={className} />;
}

export function RoundIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Clock className={className} />;
}
