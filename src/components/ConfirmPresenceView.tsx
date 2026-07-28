import React, { useState } from "react";
import { CheckCircle2, User, Sparkles, Check } from "lucide-react";
import { CallOccurrence } from "../types";

interface ConfirmPresenceViewProps {
  call: CallOccurrence;
  onDone?: () => void;
}

export const ConfirmPresenceView: React.FC<ConfirmPresenceViewProps> = ({ call, onDone }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Gestor de Mídia / Tráfego");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/confirm-presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId: call.id,
          name,
          role,
          status: "confirmed",
          notifyN8n: true,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        if (onDone) onDone();
      }
    } catch (err) {
      console.error("Erro ao confirmar presença:", err);
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
      <div className="adsata-card p-6 sm:p-8 space-y-6 border-[#22E025]/40 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            
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
                  onChange={(e) => setName(e.target.value)}
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
                className="w-full bg-[#0B0F10] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22E025] transition-all"
              >
                <option value="Gestor de Mídia / Tráfego">Gestor de Mídia / Tráfego</option>
                <option value="Head de Operações">Head de Operações</option>
                <option value="Comercial / Vendas">Comercial / Vendas</option>
                <option value="Copywriter / Criativos">Copywriter / Criativos</option>
                <option value="Diretoria">Diretoria</option>
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
                  <>Registrando...</>
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
              Sua presença será registrada para a reunião.
            </p>
          </form>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#153A2D] text-[#22E025] border border-[#22E025] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,224,37,0.5)]">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Presença Confirmada!
            </h3>

            <p className="text-xs text-gray-300 max-w-xs mx-auto">
              Obrigado, <strong className="text-white">{name}</strong>! Sua presença foi registrada com sucesso.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-[#22E025] underline pt-2 inline-block cursor-pointer"
            >
              Confirmar novamente
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
