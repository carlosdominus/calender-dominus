import React from "react";
import { Clock } from "lucide-react";
import { FIXED_CALL_SCHEDULE } from "../utils/calendar";

interface MinimalScheduleViewProps {
  onConfirmClick: () => void;
}

export const MinimalScheduleView: React.FC<MinimalScheduleViewProps> = ({ onConfirmClick }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      
      {/* Hero Header */}
      <div className="text-center space-y-5">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Segunda, Quarta e Sexta <br />
          <span className="text-[#22E025] drop-shadow-[0_0_25px_rgba(34,224,37,0.3)]">
            às 16:00h
          </span>
        </h1>

        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto font-medium">
          Calendário de reuniões recorrentes da Adsata. Confirme sua presença antes do início de cada sessão.
        </p>

        {/* Hero CTA Button */}
        <div className="pt-2 flex justify-center">
          <button 
            onClick={onConfirmClick} 
            className="hero-cta cursor-pointer"
          >
            Confirmar Presença na Call
            <span className="hero-cta-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7"></path>
                <path d="M7 7h10v10"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Fixed Days Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FIXED_CALL_SCHEDULE.map((item) => (
          <div
            key={item.id}
            className="adsata-card p-6 flex flex-col justify-between space-y-4 relative overflow-hidden group border-[#1E272B] hover:border-[#22E025]/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#22E025] bg-[#121A16] px-3 py-1 rounded-full border border-[#22E025]/30 uppercase">
                  {item.dayOfWeek}
                </span>
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1 bg-[#161D20] px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-[#22E025]" />
                  16:00h
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-[#22E025] transition-colors leading-snug pt-1">
                {item.topic}
              </h3>

              <p className="text-xs text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1E272B] flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>Horário de Brasília</span>
              <span className="text-[#22E025]">Ao Vivo</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
