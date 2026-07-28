import React, { useState, useEffect } from "react";
import { Clock, Send, CheckCircle2, ArrowUpRight, Sparkles, AlertCircle } from "lucide-react";
import { CallOccurrence } from "../types";
import { getTimeUntilNextCall } from "../utils/calendar";

interface HeroCallBannerProps {
  nextCall: CallOccurrence;
  onTriggerWebhook: () => Promise<{ success: boolean; message: string }>;
  onOpenConfirm: () => void;
}

export const HeroCallBanner: React.FC<HeroCallBannerProps> = ({
  nextCall,
  onTriggerWebhook,
  onOpenConfirm,
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextCall());
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextCall());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTrigger = async () => {
    setIsSending(true);
    setFeedback(null);
    try {
      const res = await onTriggerWebhook();
      if (res.success) {
        setFeedback({
          type: "success",
          text: "🚀 Webhook disparado com sucesso para o n8n! Automação iniciada para notificar o grupo.",
        });
      } else {
        setFeedback({
          type: "error",
          text: `⚠️ Log registrado: ${res.message}`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: "Erro ao comunicar com o servidor da aplicação.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12181B] via-[#0E1315] to-[#0A0D0E] border border-[#22E025]/30 p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#22E025]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#15803D]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Call Info & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#153A2D]/80 border border-[#22E025]/40 text-[#22E025] text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <span className="pulse-green"></span>
            {nextCall.isToday ? "🔥 HOJE É DIA DE CALL FIXA!" : "PRÓXIMA CALL AGENDADA"}
          </div>

          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {nextCall.dayOfWeek} às <span className="text-[#22E025]">14:30h</span>
            </h1>
            <p className="mt-2 text-lg text-gray-300 font-medium">
              {nextCall.topic}
            </p>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22E025]"></span>
              Data da Call: <strong className="text-white">{nextCall.formattedDate}</strong> • Anfitrião: <span className="text-[#22E025]">{nextCall.host}</span>
            </p>
          </div>

          {/* Action Buttons using prompt spec */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleTrigger}
              disabled={isSending}
              className="hero-cta cursor-pointer disabled:opacity-60"
            >
              {isSending ? (
                <>Disparando para n8n...</>
              ) : (
                <>
                  Disparar Webhook no n8n
                  <span className="hero-cta-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"></path><path d="M7 7h10v10"></path></svg>
                  </span>
                </>
              )}
            </button>

            <button
              onClick={onOpenConfirm}
              className="hero-cta-secondary"
            >
              <CheckCircle2 className="w-4 h-4 text-[#22E025]" />
              Confirmar Minha Presença
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-sm font-semibold flex items-start gap-3 transition-all ${
                feedback.type === "success"
                  ? "bg-[#153A2D] text-[#22E025] border border-[#22E025]/50"
                  : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#22E025] mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              )}
              <div>{feedback.text}</div>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400 border-t border-[#1E272B] pt-4">
            <span className="px-2 py-0.5 rounded bg-[#16211C] text-[#22E025] font-mono border border-[#22E025]/20">
              POST
            </span>
            <span className="font-mono text-gray-300 truncate max-w-xs md:max-w-md">
              https://nen.auto-jornada.space/webhook/calendario-calls-adsata
            </span>
          </div>
        </div>

        {/* Right Column: Countdown Clock */}
        <div className="lg:col-span-5">
          <div className="bg-[#0B0F10] border border-[#1E282C] rounded-2xl p-6 shadow-inner text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#22E025]" />
              Contagem Regressiva para as 14:30h
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-[#12181B] border border-[#1E272B] rounded-xl p-3">
                <span className="block text-3xl font-extrabold text-white font-mono">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-bold text-gray-400 uppercase">Horas</span>
              </div>
              <div className="bg-[#12181B] border border-[#1E272B] rounded-xl p-3">
                <span className="block text-3xl font-extrabold text-[#22E025] font-mono">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-bold text-gray-400 uppercase">Minutos</span>
              </div>
              <div className="bg-[#12181B] border border-[#1E272B] rounded-xl p-3">
                <span className="block text-3xl font-extrabold text-white font-mono">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-bold text-gray-400 uppercase">Segundos</span>
              </div>
            </div>

            <div className="p-3 bg-[#153A2D]/40 border border-[#22E025]/20 rounded-xl text-xs text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#22E025] font-semibold">
                <Sparkles className="w-4 h-4" />
                Horário Fixo: 14:30 BRT
              </span>
              <span className="text-gray-400">Seg • Qua • Sex</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
