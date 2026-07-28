import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { MinimalScheduleView } from "./components/MinimalScheduleView";
import { ConfirmPresenceView } from "./components/ConfirmPresenceView";
import { PresenceDashboardView } from "./components/PresenceDashboardView";
import { getUpcomingCalls } from "./utils/calendar";
import { CallOccurrence } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"calendar" | "confirm" | "presences">("calendar");
  const [upcomingCalls, setUpcomingCalls] = useState<CallOccurrence[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallOccurrence | null>(null);

  // Sync tab with URL parameter or hash
  const syncTabFromUrl = () => {
    if (typeof window === "undefined") return;
    
    const params = new URLSearchParams(window.location.search);
    const aba = params.get("aba") || params.get("page") || params.get("tab");
    const hash = window.location.hash.replace("#", "");
    const path = window.location.pathname.replace("/", "");

    if (aba === "confirmar" || aba === "confirm" || hash === "confirmar" || path === "confirmar") {
      setActiveTab("confirm");
    } else if (aba === "presencas" || aba === "presences" || hash === "presencas" || path === "presencas") {
      setActiveTab("presences");
    } else if (aba === "calendario" || hash === "calendario" || path === "calendario") {
      setActiveTab("calendar");
    }
  };

  const handleNavigate = (tab: "calendar" | "confirm" | "presences") => {
    setActiveTab(tab);
    
    if (typeof window !== "undefined") {
      const tabParamMap = {
        calendar: "calendario",
        confirm: "confirmar",
        presences: "presencas",
      };
      const paramValue = tabParamMap[tab];
      const newUrl = `${window.location.pathname}?aba=${paramValue}`;
      window.history.pushState({ tab }, "", newUrl);
    }
  };

  useEffect(() => {
    const calls = getUpcomingCalls(3);
    setUpcomingCalls(calls);
    if (calls.length > 0) {
      setSelectedCall(calls[0]);
    }

    syncTabFromUrl();

    const handlePopState = () => {
      syncTabFromUrl();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const currentCall = selectedCall || upcomingCalls[0] || {
    id: "call-today",
    date: new Date().toISOString().split("T")[0],
    formattedDate: "Segunda-feira",
    dayOfWeek: "Segunda-feira",
    time: "16:00",
    topic: "Call de Alinhamento Semanal Adsata",
    host: "Time Adsata",
    isToday: true,
    status: "upcoming",
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col font-sans selection:bg-[#22E025] selection:text-black relative">
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Clean Navbar */}
        <Navbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
        />

        {/* Main View Container */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "calendar" && (
            <MinimalScheduleView
              onConfirmClick={() => handleNavigate("confirm")}
            />
          )}

          {activeTab === "confirm" && (
            <ConfirmPresenceView
              call={currentCall}
              onDone={() => handleNavigate("presences")}
            />
          )}

          {activeTab === "presences" && (
            <PresenceDashboardView />
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-[#1A2024]/60 bg-[#080A0B]/80 py-6 text-xs text-gray-500 text-center backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img 
                src="https://dominus.site/image/logo-branca.png" 
                alt="Dominus Logo" 
                className="h-5 object-contain opacity-80"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-gray-400 font-medium">• Adsata Calls</span>
            </div>

            <span className="text-gray-500 text-[11px]">
              Segunda, Quarta e Sexta às 16:00h
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
