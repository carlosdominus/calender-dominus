import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent File Storage Helper
const DATA_DIR = path.join(process.cwd(), "data");
const PRESENCE_FILE = path.join(DATA_DIR, "presences.json");

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadPresencesFromDisk(): PresenceConfirmation[] {
  try {
    ensureDataDirectory();
    if (fs.existsSync(PRESENCE_FILE)) {
      const data = fs.readFileSync(PRESENCE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Erro ao carregar presenças do disco:", err);
  }
  return [];
}

function savePresencesToDisk(presences: PresenceConfirmation[]) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(PRESENCE_FILE, JSON.stringify(presences, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar presenças no disco:", err);
  }
}

// In-memory data store with disk backing for confirmations
interface CallEvent {
  id: string;
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Segunda-feira, 28/07/2026"
  dayOfWeek: "Segunda-feira" | "Quarta-feira" | "Sexta-feira";
  time: string; // "16:00"
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

// Initial data & config
let DEFAULT_WEBHOOK_URL = "https://nen.auto-jornada.space/webhook/calendario-calls-adsata";

let callTopics: Record<string, { topic: string; host: string }> = {
  "Segunda-feira": { topic: "Alinhamento Semanal", host: "Equipe Adsata" },
  "Quarta-feira": { topic: "Revisão de Meio de Semana", host: "Equipe Adsata" },
  "Sexta-feira": { topic: "Fechamento da Semana", host: "Equipe Adsata" },
};

// Load presence records from persistent file
let presenceList: PresenceConfirmation[] = loadPresencesFromDisk();

let webhookLogs: WebhookLog[] = [];

// Company Authentication Route
app.post("/api/auth/login", (req, res) => {
  const { code, password, name, role } = req.body;
  const accessKey = (code || password || "").toString().trim().toLowerCase();
  
  // Valid access keys for Adsata / Dominus team
  const validKeys = ["adsata", "dominus", "adsata2026", "dominus2026", "123456"];
  const customPass = process.env.COMPANY_PASSWORD ? process.env.COMPANY_PASSWORD.toLowerCase() : null;

  const isValid = validKeys.includes(accessKey) || (customPass && accessKey === customPass);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: "Código de acesso incorreto. Utilize o código da empresa (ex: adsata)."
    });
  }

  const userSession = {
    name: name?.trim() || "Membro Adsata",
    role: role || "Equipe Adsata",
    company: "Adsata / Dominus",
    token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  res.json({
    success: true,
    user: userSession,
  });
});

// API Routes

// Get System Status & Webhook Config
app.get("/api/config", (req, res) => {
  res.json({
    webhookUrl: DEFAULT_WEBHOOK_URL,
    callDays: ["Segunda-feira", "Quarta-feira", "Sexta-feira"],
    callTime: "16:00",
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
    time: "16:00",
    timeFormatted: "16:00h (Horário de Brasília)",
    topic: topic || "Call Semanal Adsata",
    host: host || "Equipe Adsata",
    confirmationUrl: finalConfirmationUrl,
    messagePrompt: `🚨 *Call Adsata Hoje às 16:00h!*\n📌 *Pauta:* ${topic || "Alinhamento de Equipe"}\n👉 *Confirme sua presença aqui:* ${finalConfirmationUrl}`,
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

// Record Presence Confirmation
app.post("/api/confirm-presence", (req, res) => {
  const { callId, name, email, role, status, notes } = req.body;

  if (!name || !callId) {
    return res.status(400).json({ error: "Nome e callId são obrigatórios" });
  }

  const newPresence: PresenceConfirmation = {
    id: `pres-${Date.now()}`,
    callId,
    name: name.trim(),
    email: email || `${name.trim().toLowerCase().replace(/\s+/g, ".")}@adsata.com`,
    role: role || "Membro da Equipe",
    status: status || "confirmed",
    notes: notes || "",
    timestamp: new Date().toISOString(),
  };

  // Prevent exact duplicate entries (same callId and same name)
  presenceList = presenceList.filter(
    (p) => !(p.callId === callId && p.name.toLowerCase() === newPresence.name.toLowerCase())
  );

  presenceList.unshift(newPresence);
  savePresencesToDisk(presenceList);

  res.json({
    success: true,
    presence: newPresence,
    allPresences: presenceList.filter((p) => p.callId === callId),
  });
});

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
