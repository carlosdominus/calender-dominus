import { PresenceConfirmation } from "../types";

const LOCAL_STORAGE_KEY = "adsata_presence_confirmations_v1";

export function getLocalPresences(): PresenceConfirmation[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Erro ao ler presenças do localStorage:", err);
  }
  return [];
}

export function saveLocalPresence(presence: PresenceConfirmation): PresenceConfirmation[] {
  const current = getLocalPresences();
  
  // Filter out any duplicate with same ID or same callId + name
  const filtered = current.filter(
    (p) =>
      p.id !== presence.id &&
      !(p.callId === presence.callId && p.name.trim().toLowerCase() === presence.name.trim().toLowerCase())
  );
  
  const updated = [presence, ...filtered];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Erro ao salvar presença no localStorage:", err);
  }
  return updated;
}

export async function submitPresenceConfirmation(
  callId: string,
  name: string,
  role: string
): Promise<{ success: boolean; presence: PresenceConfirmation }> {
  const cleanName = name.trim();
  const newPresence: PresenceConfirmation = {
    id: `pres-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    callId,
    name: cleanName,
    email: `${cleanName.toLowerCase().replace(/\s+/g, ".")}@adsata.com`,
    role: role || "Equipe Adsata",
    status: "confirmed",
    timestamp: new Date().toISOString(),
  };

  // 1. Save locally FIRST so confirmation is guaranteed and instant
  saveLocalPresence(newPresence);

  // 2. Send to backend server API
  try {
    const res = await fetch("/api/confirm-presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callId,
        name: cleanName,
        role,
        status: "confirmed",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.presence) {
        saveLocalPresence(data.presence);
        return { success: true, presence: data.presence };
      }
    }
  } catch (err) {
    console.warn("Servidor backend temporariamente indisponível. Salvo localmente com sucesso:", err);
  }

  // Local save succeeded regardless of network status!
  return { success: true, presence: newPresence };
}

export async function fetchAllPresences(): Promise<PresenceConfirmation[]> {
  const localList = getLocalPresences();
  
  try {
    const res = await fetch("/api/presences");
    if (res.ok) {
      const serverList: PresenceConfirmation[] = await res.json();
      
      // Merge serverList and localList
      const map = new Map<string, PresenceConfirmation>();

      localList.forEach((p) => {
        const key = `${p.callId}-${p.name.trim().toLowerCase()}`;
        map.set(key, p);
      });

      serverList.forEach((p) => {
        const key = `${p.callId}-${p.name.trim().toLowerCase()}`;
        map.set(key, p);
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}

      return merged;
    }
  } catch (err) {
    console.warn("Utilizando presenças locais:", err);
  }

  return localList;
}

export async function updatePresenceConfirmation(
  id: string,
  name: string,
  role: string
): Promise<boolean> {
  const cleanName = name.trim();
  const current = getLocalPresences();
  const index = current.findIndex((p) => p.id === id);

  if (index !== -1) {
    current[index] = {
      ...current[index],
      name: cleanName,
      role: role || current[index].role,
      email: `${cleanName.toLowerCase().replace(/\s+/g, ".")}@adsata.com`,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    } catch (err) {}
  }

  try {
    const res = await fetch(`/api/presence/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanName, role }),
    });
    return res.ok;
  } catch (err) {
    console.warn("Update enviado localmente:", err);
  }
  return true;
}

export async function deletePresenceConfirmation(id: string): Promise<boolean> {
  const current = getLocalPresences().filter((p) => p.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {}

  try {
    const res = await fetch(`/api/presence/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("Remoção realizada localmente:", err);
  }
  return true;
}
