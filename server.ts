import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for call agendas, webhook logs, and confirmations
interface CallEvent {
  id: string;
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Segunda-feira, 28/07/2026"
  dayOfWeek: "Segunda-feira" | "Quarta-feira" | "Sexta-feira";
  time: string; // "14:30"
  topic: string;
  host: string;
  status: "scheduled" | "dispatched" | "completed" | "cancelled";
  meetingUrl?: string;
  dispatchedAt?: string;
}

interface PresenceConfirmation {
  id: string;
  callId: string;
  name: string;
  email: string;
  role: string;
  status: "confirmed" | "late" | "absent";
  notes?: string;
  timestamp: string;
}

interface WebhookLog {
  id: string;
  type: "dispatch_n8n" | "presence_response";
  url: string;
  payload: any;
  status: "success" | "error";
  statusCode?: number;
  response?: string;
  timestamp: string;
}

// Initial mock data & config
let DEFAULT_WEBHOOK_URL = "https://nen.auto-jornada.space/webhook/calendario-calls-adsata";

// Pre-fill some topics for Mon, Wed, Fri calls
let callTopics: Record<string, { topic: string; host: string }> = {
  "Segunda-feira": { topic: "Call de Alinhamento Semanal & Metas Adsata", host: "Time de Ops" },
  "Quarta-feira": { topic: "Review de Performance, Tráfego e Campanhas", host: "Time de Mídia" },
  "Sexta-feira": { topic: "Fechamento Semanal, Retrospectiva e Próximos Passos", host: "Gestão & Diretoria" },
};

let presenceList: PresenceConfirmation[] = [
  {
    id: "pres-1",
    callId: "call-today",
    name: "Carlos Eduardo",
    email: "carlos@adsata.com",
    role: "Gestor de Tráfego",
    status: "confirmed",
    notes: "Estararei pontual na call das 14:30h!",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "pres-2",
    callId: "call-today",
    name: "Mariana Silva",
    email: "mariana@adsata.com",
    role: "Head de Operações",
    status: "confirmed",
    notes: "Pauta de clientes atualizada",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

let webhookLogs: WebhookLog[] = [];

// API Routes

// Get System Status & Webhook Config
app.get("/api/config", (req, res) => {
  res.json({
    webhookUrl: DEFAULT_WEBHOOK_URL,
    callDays: ["Segunda-feira", "Quarta-feira", "Sexta-feira"],
    callTime: "14:30",
    timezone: "America/Sao_Paulo",
    topics: callTopics,
  });
});

// Update Webhook Config
app.post("/api/config", (req, res) => {
  const { webhookUrl, topics } = req.body;
  if (webhookUrl) DEFAULT_WEBHOOK_URL = webhookUrl;
  if (topics) callTopics = { ...callTopics, ...topics };
  res.json({ success: true, webhookUrl: DEFAULT_WEBHOOK_URL, topics: callTopics });
});

// Get Webhook Logs
app.get("/api/logs", (req, res) => {
  res.json(webhookLogs.slice(-50).reverse());
});

// Get Presences
app.get("/api/presences", (req, res) => {
  const { callId } = req.query;
  if (callId) {
    return res.json(presenceList.filter(p => p.callId === (callId as string)));
  }
  res.json(presenceList);
});

// Trigger Webhook to n8n for a Call
app.post("/api/trigger-webhook", async (req, res) => {
  const { callId, date, dayOfWeek, topic, host, confirmationUrl } = req.body;
  const targetUrl = req.body.webhookUrl || DEFAULT_WEBHOOK_URL;

  const appBaseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const finalConfirmationUrl = confirmationUrl || `${appBaseUrl}/?page=confirm&callId=${callId || "call-today"}`;

  const payload = {
    event: "CALENDARIO_CALLS_DISPARO",
    callId: callId || `call-${Date.now()}`,
    dayOfWeek: dayOfWeek || "Segunda-feira",
    date: date || new Date().toISOString().split("T")[0],
    time: "14:30",
    timeFormatted: "14:30h (Horário de Brasília)",
    topic: topic || "Call Semanal Adsata",
    host: host || "Equipe Adsata",
    confirmationUrl: finalConfirmationUrl,
    messagePrompt: `🚨 *Call Adsata Hoje às 14:30h!*\n📌 *Pauta:* ${topic || "Alinhamento de Equipe"}\n👉 *Confirme sua presença aqui:* ${finalConfirmationUrl}`,
    timestamp: new Date().toISOString(),
  };

  const logEntry: WebhookLog = {
    id: `log-${Date.now()}`,
    type: "dispatch_n8n",
    url: targetUrl,
    payload,
    status: "success",
    timestamp: new Date().toISOString(),
  };

  try {
    const fetchResponse = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    logEntry.statusCode = fetchResponse.status;
    const responseText = await fetchResponse.text();
    logEntry.response = responseText.slice(0, 500);

    if (fetchResponse.ok) {
      logEntry.status = "success";
    } else {
      logEntry.status = "error";
    }
  } catch (err: any) {
    logEntry.status = "error";
    logEntry.response = err.message || "Erro de conexão ao enviar webhook para n8n";
  }

  webhookLogs.push(logEntry);

  res.json({
    success: logEntry.status === "success",
    log: logEntry,
    message: logEntry.status === "success" 
      ? "Webhook disparado com sucesso para o n8n!" 
      : `Webhook tentou ser enviado, porém retornou erro ou não pôde ser alcançado. Detalhes salvos nos logs.`,
  });
});

// Record Presence Confirmation and Optionally Send Webhook back to n8n
app.post("/api/confirm-presence", async (req, res) => {
  const { callId, name, email, role, status, notes, notifyN8n } = req.body;

  if (!name || !callId) {
    return res.status(400).json({ error: "Nome e callId são obrigatórios" });
  }

  const newPresence: PresenceConfirmation = {
    id: `pres-${Date.now()}`,
    callId,
    name,
    email: email || "membro@adsata.com",
    role: role || "Membro da Equipe",
    status: status || "confirmed",
    notes: notes || "",
    timestamp: new Date().toISOString(),
  };

  presenceList.unshift(newPresence);

  // If requested to notify n8n about response
  let n8nNotification = null;
  if (notifyN8n !== false) {
    const payload = {
      event: "PRESENCA_CONFIRMADA_CALL",
      confirmationId: newPresence.id,
      callId: newPresence.callId,
      name: newPresence.name,
      email: newPresence.email,
      role: newPresence.role,
      status: newPresence.status,
      notes: newPresence.notes,
      timestamp: newPresence.timestamp,
      clickupMessage: `✅ *Presença Confirmada na Call:* ${newPresence.name} (${newPresence.role}) - Status: ${newPresence.status === 'confirmed' ? 'Confirmado' : newPresence.status === 'late' ? 'Irá se atrasar' : 'Ausente'}`,
    };

    const targetUrl = DEFAULT_WEBHOOK_URL;
    const logEntry: WebhookLog = {
      id: `log-res-${Date.now()}`,
      type: "presence_response",
      url: targetUrl,
      payload,
      status: "success",
      timestamp: new Date().toISOString(),
    };

    try {
      const resp = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      logEntry.statusCode = resp.status;
      logEntry.response = (await resp.text()).slice(0, 500);
      logEntry.status = resp.ok ? "success" : "error";
    } catch (e: any) {
      logEntry.status = "error";
      logEntry.response = e.message;
    }

    webhookLogs.push(logEntry);
    n8nNotification = logEntry;
  }

  res.json({
    success: true,
    presence: newPresence,
    n8nLog: n8nNotification,
    allPresences: presenceList.filter(p => p.callId === callId),
  });
});

// Automated daily trigger at 07:00 AM on Mon, Wed, Fri
let lastAutoTriggerDate = "";

function checkAndAutoTriggerWebhook() {
  const now = new Date();
  
  // Convert time to BRT (UTC-3)
  const brtTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const dayOfWeek = brtTime.getDay(); // 1 = Mon, 3 = Wed, 5 = Fri
  const hours = brtTime.getHours();
  const minutes = brtTime.getMinutes();
  const todayStr = brtTime.toISOString().split("T")[0];

  // If Monday (1), Wednesday (3), or Friday (5) and time is 07:00 AM
  if ((dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) && hours === 7 && minutes === 0) {
    if (lastAutoTriggerDate !== todayStr) {
      lastAutoTriggerDate = todayStr;
      
      const dayNameMap: Record<number, "Segunda-feira" | "Quarta-feira" | "Sexta-feira"> = {
        1: "Segunda-feira",
        3: "Quarta-feira",
        5: "Sexta-feira",
      };
      
      const dayName = dayNameMap[dayOfWeek];
      const topicInfo = callTopics[dayName] || { topic: "Call de Alinhamento Semanal Adsata", host: "Time Adsata" };
      
      const appBaseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const confirmationUrl = `${appBaseUrl}/?page=confirm&callId=call-${todayStr}`;

      const payload = {
        event: "AUTOMATIC_DISPATCH_07AM",
        callId: `call-${todayStr}`,
        dayOfWeek: dayName,
        date: todayStr,
        time: "14:30",
        timeFormatted: "14:30h (Horário de Brasília)",
        topic: topicInfo.topic,
        host: topicInfo.host,
        confirmationUrl,
        messagePrompt: `🚨 *Call Adsata Hoje às 14:30h!*\n📌 *Pauta:* ${topicInfo.topic}\n👉 *Confirme sua presença aqui:* ${confirmationUrl}`,
        timestamp: new Date().toISOString(),
      };

      console.log(`[07:00 AM AUTO DISPATCH] Triggering n8n webhook for ${dayName}...`);
      
      fetch(DEFAULT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const respText = await res.text();
          webhookLogs.push({
            id: `auto-log-${Date.now()}`,
            type: "dispatch_n8n",
            url: DEFAULT_WEBHOOK_URL,
            payload,
            status: res.ok ? "success" : "error",
            statusCode: res.status,
            response: respText.slice(0, 500),
            timestamp: new Date().toISOString(),
          });
        })
        .catch((err) => {
          webhookLogs.push({
            id: `auto-log-${Date.now()}`,
            type: "dispatch_n8n",
            url: DEFAULT_WEBHOOK_URL,
            payload,
            status: "error",
            response: err.message,
            timestamp: new Date().toISOString(),
          });
        });
    }
  }
}

// Check every 30 seconds
setInterval(checkAndAutoTriggerWebhook, 30000);

async function startServer() {
  // Serve static assets or Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
