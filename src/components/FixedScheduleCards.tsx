import React from "react";
import { FIXED_CALL_SCHEDULE } from "../utils/calendar";
import { Clock, Users, ArrowRight, Video, MessageSquare } from "lucide-react";

interface FixedScheduleCardsProps {
  onSelectDay: (dayOfWeek: string) => void;
}

export const FixedScheduleCards: React.FC<FixedScheduleCardsProps> = ({ onSelectDay }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22E025] inline-block"></span>
            Calendário Semanal Fixo de Calls Adsata
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Reuniões fixas recorrentes todas as <strong className="text-gray-200">Segundas, Quartas e Sextas-feiras às 14:30h</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#121719] px-3.5 py-2 rounded-xl border border-[#1E272B]">
          <Clock className="w-4 h-4 text-[#22E025]" />
          <span>Frequência: 3x por semana (14:30 BRT)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FIXED_CALL_SCHEDULE.map((item) => {
          const isSeg = item.dayShort === "SEG";
          const isQua = item.dayShort === "QUA";
          const isSex = item.dayShort === "SEX";

          return (
            <div
              key={item.id}
              className="adsata-card p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_0_25px_rgba(34,224,37,0.15)] transition-all"
            >
              {/* Accent top border highlight */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isSeg
                    ? "bg-gradient-to-r from-emerald-500 to-[#22E025]"
                    : isQua
                    ? "bg-gradient-to-r from-green-400 to-emerald-600"
                    : "bg-gradient-to-r from-[#22E025] to-teal-400"
                }`}
              ></div>

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black tracking-widest px-3 py-1 rounded-full bg-[#153A2D] text-[#22E025] border border-[#22E025]/30 uppercase">
                    {item.dayShort} • {item.dayOfWeek}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-extrabold text-white bg-[#1A2226] px-3 py-1 rounded-lg border border-[#2A363C]">
                    <Clock className="w-3.5 h-3.5 text-[#22E025]" />
                    {item.time}h
                  </div>
                </div>

                {/* Title & Topic */}
                <h3 className="text-lg font-extrabold text-white group-hover:text-[#22E025] transition-colors leading-snug">
                  {item.topic}
                </h3>

                <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1E272B] space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <Users className="w-3.5 h-3.5 text-[#22E025]" />
                    Anfitrião:
                  </span>
                  <span className="font-semibold text-gray-200">{item.host}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <MessageSquare className="w-3.5 h-3.5 text-[#22E025]" />
                    Automação:
                  </span>
                  <span className="text-[#22E025] font-semibold">Webhook n8n</span>
                </div>

                <button
                  onClick={() => onSelectDay(item.dayOfWeek)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#161E21] hover:bg-[#1C272B] text-xs font-bold text-gray-200 hover:text-[#22E025] border border-[#232F34] hover:border-[#22E025]/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Video className="w-4 h-4 text-[#22E025]" />
                  Simular Disparo de {item.dayShort}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
