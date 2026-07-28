import React, { useState, useEffect } from "react";
import { Zap, Send, Code, Terminal, CheckCircle2, AlertCircle, RefreshCw, Copy, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { WebhookLog } from "../types";

interface WebhookHubViewProps {
  onTriggerWebhook: (customPayload?: any) => Promise<{ success: boolean; message: string }>;
}

export const WebhookHubView: React.FC<WebhookHubViewProps> = ({ onTriggerWebhook }) => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("https://nen.auto-jornada.space/webhook/calendario-calls-adsata");
  const [isSending, setIsSending] = useState(false);
  const [testDay, setTestDay] = useState<"Segunda-feira" | "Quarta-feira" | "Sexta-feira">("Segunda-feira");
  const [testTopic, setTestTopic] = useState("Call de Alinhamento Semanal Adsata");
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestTrigger = async () => {
    setIsSending(true);
    try {
      await onTriggerWebhook({
        dayOfWeek: testDay,
        topic: testTopic,
        webhookUrl,
      });
      await fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const samplePayload = {
    event: "CALENDARIO_CALLS_DISPARO",
    callId: "call-2026-07-28",
    dayOfWeek: testDay,
    date: "2026-07-28",
    time: "14:30",
    timeFormatted: "14:30h (Horário de Brasília)",
    topic: testTopic,
    host: "Equipe Adsata",
    confirmationUrl: `${typeof window !== "undefined" ? window.location.origin : "https://adsata-calls.app"}/?page=confirm&callId=call-2026-07-28`,
    messagePrompt: `🚨 *Call Adsata Hoje às 14:30h!*\n📌 *Pauta:* ${testTopic}\n👉 *Confirme sua presença aqui:* ...`,
    timestamp: new Date().toISOString(),
  };

  const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;

  const copyToClipboard = (text: string, isCurl: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#153A2D] text-[#22E025] border border-[#22E025]/30 text-xs font-extrabold uppercase">
            <Zap className="w-4 h-4 fill-[#22E025]" />
            Central de Integração n8n & Webhooks
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Automação de Disparo de Calls
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure o endpoint do seu n8n e teste o envio das notificações para os grupos e integração com o ClickUp.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#12181B] hover:bg-[#1A2226] text-xs font-bold text-gray-200 border border-[#1E272B] flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#22E025]" />
          Atualizar Logs
        </button>
      </div>

      {/* Webhook Endpoint Config Card */}
      <div className="adsata-card p-6 border-[#22E025]/30 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#22E025]" />
          URL do Webhook n8n Configurada
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#0B0F10] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-3 px-4 text-sm font-mono text-[#22E025] focus:outline-none"
            />
          </div>
          <button
            onClick={() => copyToClipboard(webhookUrl)}
            className="px-5 py-3 rounded-xl bg-[#153A2D] hover:bg-[#1A4939] text-[#22E025] font-bold text-xs border border-[#22E025]/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "URL Copiada!" : "Copiar URL"}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F10] border border-[#1E272B] text-xs text-gray-300 space-y-2">
          <p className="font-bold text-[#22E025] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Fluxo de Funcionamento no n8n:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-400 pl-2">
            <li>O nosso sistema dispara a chamada HTTP <strong className="text-white">POST</strong> para o n8n no início do dia de call (14:30h ou 08:00h).</li>
            <li>O n8n recebe o JSON com <strong className="text-white">topic</strong> e <strong className="text-white">confirmationUrl</strong>.</li>
            <li>O n8n envia mensagem no grupo do time/WhatsApp com o link de confirmação.</li>
            <li>Quando o participante confirma, novo disparo alimenta o n8n e registra no <strong className="text-white">ClickUp</strong>.</li>
          </ol>
        </div>
      </div>

      {/* Manual Test Dispatch & Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Test Control */}
        <div className="lg:col-span-5 adsata-card p-6 space-y-5">
          <h3 className="text-md font-extrabold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-[#22E025]" />
            Testar Disparo Manual para n8n
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                Dia da Call
              </label>
              <select
                value={testDay}
                onChange={(e: any) => setTestDay(e.target.value)}
                className="w-full bg-[#0B0F10] border border-[#1E272B] rounded-xl py-2.5 px-3 text-sm text-white"
              >
                <option value="Segunda-feira">Segunda-feira (14:30h)</option>
                <option value="Quarta-feira">Quarta-feira (14:30h)</option>
                <option value="Sexta-feira">Sexta-feira (14:30h)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                Pauta da Reunião
              </label>
              <input
                type="text"
                value={testTopic}
                onChange={(e) => setTestTopic(e.target.value)}
                className="w-full bg-[#0B0F10] border border-[#1E272B] rounded-xl py-2.5 px-3 text-sm text-white"
              />
            </div>

            <button
              onClick={handleTestTrigger}
              disabled={isSending}
              className="hero-cta w-full cursor-pointer"
            >
              {isSending ? "Enviando Requisição..." : "Disparar Webhook de Teste"}
              <span className="hero-cta-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"></path><path d="M7 7h10v10"></path></svg>
              </span>
            </button>
          </div>
        </div>

        {/* JSON Preview & cURL */}
        <div className="lg:col-span-7 adsata-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-extrabold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-[#22E025]" />
              Estrutura do JSON Enviado
            </h3>
            <button
              onClick={() => copyToClipboard(curlExample, true)}
              className="text-xs font-bold text-[#22E025] hover:underline flex items-center gap-1"
            >
              {copiedCurl ? "cURL Copiado!" : "Copiar comando cURL"}
            </button>
          </div>

          <div className="bg-[#070A0B] border border-[#1E272B] rounded-xl p-4 overflow-x-auto text-xs font-mono text-gray-300">
            <pre className="text-[#22E025] leading-relaxed">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>
        </div>

      </div>

      {/* Webhook Transmission Logs */}
      <div className="adsata-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E272B] pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#22E025]" />
            Histórico de Disparos e Requisições ({logs.length})
          </h3>
          <span className="text-xs text-gray-400">Logs mantidos no servidor</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Nenhum disparo registrado ainda. Clique no botão de disparo manual acima para realizar um teste!
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-[#0B0F10] border border-[#1E272B] hover:border-[#22E025]/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        log.status === "success"
                          ? "bg-[#153A2D] text-[#22E025] border border-[#22E025]/40"
                          : "bg-rose-950 text-rose-400 border border-rose-500/40"
                      }`}
                    >
                      {log.status === "success" ? "200 OK" : "ERRO"}
                    </span>
                    <span className="font-mono text-gray-300 font-semibold">{log.type}</span>
                  </div>

                  <span className="text-gray-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString("pt-BR")}
                  </span>
                </div>

                <div className="text-xs font-mono text-gray-400 truncate">
                  Target: <span className="text-gray-200">{log.url}</span>
                </div>

                {log.response && (
                  <div className="text-[11px] font-mono bg-[#11171A] p-2 rounded border border-[#1C2529] text-gray-300 truncate">
                    Resposta n8n: {log.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
