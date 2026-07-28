import React, { useState } from "react";
import { CallOccurrence } from "../types";
import { Calendar, Clock, Copy, Check, ExternalLink, CheckCircle2, Send } from "lucide-react";

interface UpcomingCallsListProps {
  calls: CallOccurrence[];
  onOpenConfirm: (call: CallOccurrence) => void;
  onTriggerWebhook: (call: CallOccurrence) => void;
}

export const UpcomingCallsList: React.FC<UpcomingCallsListProps> = ({
  calls,
  onOpenConfirm,
  onTriggerWebhook,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (call: CallOccurrence) => {
    const link = `${window.location.origin}/?page=confirm&callId=${call.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(call.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#22E025]" />
            Próximas Calls Agendadas na Agenda
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Gere o link de confirmação para qualquer data e envie com 1 clique para a automação n8n.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calls.map((call, idx) => {
          const isNext = idx === 0;

          return (
            <div
              key={call.id}
              className={`adsata-card p-5 space-y-4 relative ${
                isNext ? "border-[#22E025]/50 bg-gradient-to-b from-[#131A1D] to-[#0E1315]" : ""
              }`}
            >
              {isNext && (
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#153A2D] text-[#22E025] border border-[#22E025]/40">
                  Próxima Call
                </span>
              )}

              <div>
                <span className="text-xs font-bold text-[#22E025] uppercase tracking-wider block">
                  {call.dayOfWeek} • {call.time}h
                </span>
                <h3 className="text-md font-extrabold text-white mt-1 leading-snug">
                  {call.topic}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Data: <strong className="text-gray-200">{call.formattedDate}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E272B] space-y-2">
                <button
                  onClick={() => onOpenConfirm(call)}
                  className="w-full py-2 px-3 rounded-xl bg-[#153A2D] hover:bg-[#1C4939] text-[#22E025] text-xs font-bold border border-[#22E025]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Página de Confirmação
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(call)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#12181B] hover:bg-[#1A2226] text-gray-300 text-[11px] font-semibold border border-[#1E272B] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedId === call.id ? <Check className="w-3.5 h-3.5 text-[#22E025]" /> : <Copy className="w-3.5 h-3.5 text-[#22E025]" />}
                    {copiedId === call.id ? "Copiado!" : "Copiar Link"}
                  </button>

                  <button
                    onClick={() => onTriggerWebhook(call)}
                    title="Disparar webhook no n8n para esta call"
                    className="p-2 rounded-lg bg-[#12181B] hover:bg-[#153A2D] text-[#22E025] border border-[#1E272B] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
