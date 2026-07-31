import React, { useState } from "react";
import { User, Sparkles, Check, ArrowRight, AlertCircle } from "lucide-react";
import { CallOccurrence } from "../types";

interface ConfirmPresenceViewProps {
  call: CallOccurrence;
  onDone?: () => void;
}

export const ConfirmPresenceView: React.FC<ConfirmPresenceViewProps> = ({ call, onDone }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Editor de Criativo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Por favor, preencha o seu nome para confirmar.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/confirm-presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId: call.id,
          name: cleanName,
          role,
          status: "confirmed",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        // Automatically switch to Presenças tab after 1.5s so user sees success first
        setTimeout(() => {
          if (onDone) onDone();
        }, 1500);
      } else {
        setErrorMsg(data.error || "Não foi possível registrar a presença. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao confirmar presença:", err);
      setErrorMsg("Falha na conexão com o servidor. Verifique sua internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#153A2D] text-[#22E025] border border-[#22E025]/30 text-xs font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Confirmação de Presença
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Call {call.dayOfWeek} às <span className="text-[#22E025]">16:00h</span>
        </h1>

        <p className="text-gray-400 text-xs font-medium">
          {call.topic} • {call.formattedDate}
        </p>
      </div>

      {/* Confirmation Form Card */}
      <div className="adsata-card p-6 sm:p-8 space-y-6 border-[#22E025]/40 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-gray-300">
                Seu Nome <span className="text-[#22E025]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full bg-[#0B0F10] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22E025] transition-all"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-gray-300">
                Cargo / Área
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0B0F10] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22E025] transition-all cursor-pointer"
              >
                <option value="Editor de Criativo">Editor de Criativo</option>
                <option value="Copy de Criativo">Copy de Criativo</option>
                <option value="Copy de VSL">Copy de VSL</option>
                <option value="Editor de VSL">Editor de VSL</option>
                <option value="Gestor de Tráfego">Gestor de Tráfego</option>
                <option value="Head">Head</option>
              </select>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="hero-cta w-full cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Registrando presença...</>
                ) : (
                  <>
                    Confirmar Presença
                    <span className="hero-cta-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17 17 7"></path>
                        <path d="M7 7h10v10"></path>
                      </svg>
                    </span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-gray-500 text-center">
              Sua presença será registrada para a reunião em tempo real.
            </p>
          </form>
        ) : (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#153A2D] text-[#22E025] border-2 border-[#22E025] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(34,224,37,0.5)]">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white">
                Presença Confirmada!
              </h3>
              <p className="text-xs text-gray-300">
                Obrigado, <strong className="text-[#22E025]">{name}</strong> ({role})!
              </p>
            </div>

            <p className="text-[11px] text-gray-400 max-w-xs mx-auto pt-1">
              Redirecionando para a lista de presenças...
            </p>

            <button
              onClick={() => {
                if (onDone) onDone();
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#153A2D] hover:bg-[#1E4D3C] text-[#22E025] border border-[#22E025]/40 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Ver Lista de Presenças</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
