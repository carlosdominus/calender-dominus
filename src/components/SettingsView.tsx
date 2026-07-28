import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, Clock, Globe, MessageSquare } from "lucide-react";

export const SettingsView: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState("https://nen.auto-jornada.space/webhook/calendario-calls-adsata");
  const [segundaTopic, setSegundaTopic] = useState("Call de Alinhamento Semanal & Metas Adsata");
  const [segundaHost, setSegundaHost] = useState("Time de Ops & Diretoria");
  const [quartaTopic, setQuartaTopic] = useState("Review de Performance, Tráfego & Campanhas");
  const [quartaHost, setQuartaHost] = useState("Time de Mídia & Analytics");
  const [sextaTopic, setSextaTopic] = useState("Fechamento Semanal, Retrospectiva e Próximos Passos");
  const [sextaHost, setSextaHost] = useState("Gestão & Liderança");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
        if (data.topics) {
          if (data.topics["Segunda-feira"]) {
            setSegundaTopic(data.topics["Segunda-feira"].topic);
            setSegundaHost(data.topics["Segunda-feira"].host);
          }
          if (data.topics["Quarta-feira"]) {
            setQuartaTopic(data.topics["Quarta-feira"].topic);
            setQuartaHost(data.topics["Quarta-feira"].host);
          }
          if (data.topics["Sexta-feira"]) {
            setSextaTopic(data.topics["Sexta-feira"].topic);
            setSextaHost(data.topics["Sexta-feira"].host);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl,
          topics: {
            "Segunda-feira": { topic: segundaTopic, host: segundaHost },
            "Quarta-feira": { topic: quartaTopic, host: quartaHost },
            "Sexta-feira": { topic: sextaTopic, host: sextaHost },
          },
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#153A2D] text-[#22E025] border border-[#22E025]/30 text-xs font-extrabold uppercase">
          <Settings className="w-4 h-4" />
          Configurações do Sistema
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-2">
          Pautas e Webhook Adsata
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Ajuste as pautas padrão das reuniões de Segunda, Quarta e Sexta-feira e atualize o endpoint n8n.
        </p>
      </div>

      <div className="adsata-card p-6 md:p-8 space-y-8">
        {/* Webhook Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#22E025]" />
            Endpoint do Webhook n8n
          </h2>
          <div>
            <label className="block text-xs font-extrabold uppercase text-gray-300 mb-1">
              URL do Webhook do n8n
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#0B0F10] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-3 px-4 text-sm font-mono text-[#22E025]"
            />
          </div>
        </div>

        {/* Schedule & Topics */}
        <div className="space-y-6 pt-4 border-t border-[#1E272B]">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#22E025]" />
            Pautas Recorrentes (14:30h Fixa)
          </h2>

          <div className="space-y-4">
            {/* Segunda */}
            <div className="p-4 rounded-xl bg-[#0B0F10] border border-[#1E272B] space-y-3">
              <span className="text-xs font-black uppercase text-[#22E025] bg-[#153A2D] px-2.5 py-1 rounded border border-[#22E025]/30">
                Segunda-feira • 14:30h
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Pauta Padrão</label>
                  <input
                    type="text"
                    value={segundaTopic}
                    onChange={(e) => setSegundaTopic(e.target.value)}
                    className="w-full bg-[#12181B] border border-[#1E272B] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Anfitrião / Liderança</label>
                  <input
                    type="text"
                    value={segundaHost}
                    onChange={(e) => setSegundaHost(e.target.value)}
                    className="w-full bg-[#12181B] border border-[#1E272B] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Quarta */}
            <div className="p-4 rounded-xl bg-[#0B0F10] border border-[#1E272B] space-y-3">
              <span className="text-xs font-black uppercase text-[#22E025] bg-[#153A2D] px-2.5 py-1 rounded border border-[#22E025]/30">
                Quarta-feira • 14:30h
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Pauta Padrão</label>
                  <input
                    type="text"
                    value={quartaTopic}
                    onChange={(e) => setQuartaTopic(e.target.value)}
                    className="w-full bg-[#12181B] border border-[#1E272B] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Anfitrião / Liderança</label>
                  <input
                    type="text"
                    value={quartaHost}
                    onChange={(e) => setQuartaHost(e.target.value)}
                    className="w-full bg-[#12181B] border border-[#1E272B] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Sexta */}
            <div className="p-4 rounded-xl bg-[#0B0F10] border border-[#1E272B] space-y-3">
              <span className="text-xs font-black uppercase text-[#22E025] bg-[#153A2D] px-2.5 py-1 rounded border border-[#22E025]/30">
                Sexta-feira • 14:30h
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Pauta Padrão</label>
                  <input
                    type="text"
                    value={sextaTopic}
                    onChange={(e) => setSextaTopic(e.target.value)}
                    className="w-full bg-[#12181B] border border-[#1E272B] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Anfitrião / Liderança</label>
                  <input
                    type="text"
                    value={sextaHost}
                    onChange={(e) => setSextaHost(e.target.value)}
                    className="w-full bg-[#12181B] border border-[#1E272B] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-4 flex items-center justify-between border-t border-[#1E272B]">
          <button
            onClick={handleSave}
            className="hero-cta cursor-pointer"
          >
            Salvar Configurações
            <span className="hero-cta-arrow">
              <Save className="w-4 h-4 text-black" />
            </span>
          </button>

          {saved && (
            <span className="text-xs font-bold text-[#22E025] flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              Configurações salvas com sucesso!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
