import React from "react";
import { CheckCircle2, Calendar, Users } from "lucide-react";

interface NavbarProps {
  activeTab: "calendar" | "confirm" | "presences";
  onNavigate: (tab: "calendar" | "confirm" | "presences") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
}) => {
  return (
    <header className="border-b border-[#1A2024] bg-[#080A0B]/80 backdrop-blur-md sticky top-0 z-50 py-3.5 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        
        {/* Company White Logo */}
        <div 
          onClick={() => onNavigate("calendar")}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <img 
            src="https://dominus.site/image/logo-branca.png" 
            alt="Dominus Logo" 
            className="h-7 sm:h-9 object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="h-5 w-[1px] bg-[#22E025]/40 hidden sm:block"></div>
          <span className="text-xs font-bold tracking-wider text-gray-300 uppercase hidden sm:inline-block">
            Calls <span className="text-[#22E025]">16:00h</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-[#111517] p-1 rounded-full border border-[#1E272B]">
          <a
            href="?aba=calendario"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("calendar");
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "calendar"
                ? "bg-[#22E025] text-[#050E06] shadow-[0_0_15px_rgba(34,224,37,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Calendário</span>
          </a>

          <a
            href="?aba=confirmar"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("confirm");
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "confirm"
                ? "bg-[#22E025] text-[#050E06] shadow-[0_0_15px_rgba(34,224,37,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmar</span>
          </a>

          <a
            href="?aba=presencas"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("presences");
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "presences"
                ? "bg-[#22E025] text-[#050E06] shadow-[0_0_15px_rgba(34,224,37,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Presenças</span>
          </a>
        </nav>

      </div>
    </header>
  );
};
