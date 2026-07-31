import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  UserCheck,
  Edit3,
  Trash2,
  X,
  Save,
  Check
} from "lucide-react";
import { PresenceConfirmation, CallOccurrence } from "../types";
import { getUpcomingCalls } from "../utils/calendar";
import { fetchAllPresences, updatePresenceConfirmation, deletePresenceConfirmation } from "../utils/presenceStorage";

interface CallGroup {
  callId: string;
  date: string;
  formattedDate: string;
  dayOfWeek: string;
  topic: string;
  time: string;
  isToday?: boolean;
  presences: PresenceConfirmation[];
}

export const PresenceDashboardView: React.FC = () => {
  const [presences, setPresences] = useState<PresenceConfirmation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCallIds, setExpandedCallIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingItem, setEditingItem] = useState<PresenceConfirmation | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPresences = async () => {
    try {
      const data = await fetchAllPresences();
      setPresences(data);
    } catch (err) {
      console.error("Erro ao carregar presenças:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresences();
  }, []);

  const handleStartEdit = (p: PresenceConfirmation) => {
    setEditingItem(p);
    setEditName(p.name);
    setEditRole(p.role || "Editor de Criativo");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName.trim()) return;

    setIsSavingEdit(true);
    await updatePresenceConfirmation(editingItem.id, editName.trim(), editRole);
    await fetchPresences();
    setIsSavingEdit(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deletePresenceConfirmation(id);
    await fetchPresences();
    setDeletingId(null);
  };

  // Generate call groups using upcoming/past calendar calls + existing presences
  const calendarCalls = getUpcomingCalls(6);

  // Map calendar calls to groups
  const groupsMap = new Map<string, CallGroup>();

  // Add calendar calls first
  calendarCalls.forEach((call: CallOccurrence) => {
    groupsMap.set(call.id, {
      callId: call.id,
      date: call.date,
      formattedDate: call.formattedDate,
      dayOfWeek: call.dayOfWeek,
      topic: call.topic,
      time: call.time,
      isToday: call.isToday,
      presences: [],
    });
  });

  // Distribute presences into groups
  presences.forEach((p) => {
    if (groupsMap.has(p.callId)) {
      groupsMap.get(p.callId)!.presences.push(p);
    } else {
      const callDateStr = p.timestamp ? p.timestamp.split("T")[0] : new Date().toISOString().split("T")[0];
      const fallbackTitle = `Call do dia ${callDateStr.split("-").reverse().join("/")}`;
      
      groupsMap.set(p.callId, {
        callId: p.callId,
        date: callDateStr,
        formattedDate: fallbackTitle,
        dayOfWeek: "Call Especial",
        topic: "Reunião de Equipe Adsata",
        time: "16:00",
        presences: [p],
      });
    }
  });

  const allGroups = Array.from(groupsMap.values());

  // Auto-expand the first call or today's call on initial load if expandedCallIds is empty
  useEffect(() => {
    if (allGroups.length > 0 && Object.keys(expandedCallIds).length === 0) {
      const todayGroup = allGroups.find(g => g.isToday) || allGroups.find(g => g.presences.length > 0) || allGroups[0];
      if (todayGroup) {
        setExpandedCallIds({ [todayGroup.callId]: true });
      }
    }
  }, [presences]);

  const toggleExpand = (callId: string) => {
    setExpandedCallIds((prev) => ({
      ...prev,
      [callId]: !prev[callId],
    }));
  };

  const toggleExpandAll = () => {
    const allExpanded = allGroups.every((g) => expandedCallIds[g.callId]);
    const nextState: Record<string, boolean> = {};
    allGroups.forEach((g) => {
      nextState[g.callId] = !allExpanded;
    });
    setExpandedCallIds(nextState);
  };

  // Filter groups by search term (search inside member name, role, topic, date, or dayOfWeek)
  const filteredGroups = allGroups.filter((group) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    
    const matchesGroup =
      group.formattedDate.toLowerCase().includes(term) ||
      group.dayOfWeek.toLowerCase().includes(term) ||
      group.topic.toLowerCase().includes(term) ||
      group.date.includes(term);

    const matchesMember = group.presences.some(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.role.toLowerCase().includes(term)
    );

    return matchesGroup || matchesMember;
  });

  // Calculate totals
  const totalConfirmed = presences.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#22E025]" />
            Presenças por Call
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Clique em uma call para visualizar os participantes confirmados.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-full bg-[#153A2D] text-[#22E025] border border-[#22E025]/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {totalConfirmed} Confirmados
          </span>
        </div>
      </div>

      {/* Toolbar: Search and Collapse/Expand */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0B0F10] border border-[#1E272B] p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou data da call..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#12181B] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-1.5 pl-10 pr-4 text-xs text-white focus:outline-none transition-all"
          />
        </div>

        <button
          onClick={toggleExpandAll}
          className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-[#161D20] hover:bg-[#1E272B] border border-[#232D32] text-xs font-bold text-gray-300 transition-colors cursor-pointer text-center"
        >
          {allGroups.every((g) => expandedCallIds[g.callId]) ? "Recolher Todas" : "Expandir Todas"}
        </button>
      </div>

      {/* List of Calls */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="adsata-card p-8 text-center space-y-3">
            <Calendar className="w-10 h-10 text-gray-600 mx-auto opacity-50" />
            <p className="text-sm font-bold text-gray-300">Nenhuma call encontrada.</p>
            <p className="text-xs text-gray-500">
              Tente buscar por outro termo.
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isExpanded = !!expandedCallIds[group.callId];
            const groupPresences = group.presences;
            
            // Filter by search if applied
            const visiblePresences = groupPresences.filter((p) => {
              if (!searchTerm.trim()) return true;
              const term = searchTerm.toLowerCase();
              return (
                p.name.toLowerCase().includes(term) ||
                p.role.toLowerCase().includes(term)
              );
            });

            const groupConfirmed = groupPresences.length;

            return (
              <div
                key={group.callId}
                className={`adsata-card transition-all duration-200 overflow-hidden ${
                  group.isToday ? "border-[#22E025]/50 shadow-[0_0_20px_rgba(34,224,37,0.15)]" : ""
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(group.callId)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-[#12181B]/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        group.isToday
                          ? "bg-[#153A2D] text-[#22E025] border-[#22E025]"
                          : "bg-[#0B0F10] text-gray-400 border-[#1E272B]"
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                          Call de {group.formattedDate}
                        </h3>
                        {group.isToday && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#22E025] text-black animate-pulse">
                            Hoje
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 font-medium truncate">
                        {group.topic} • <span className="text-gray-300">{group.time}h</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Stats & Expand Toggle */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-md bg-[#153A2D] text-[#22E025] border border-[#22E025]/20 text-[11px] font-bold">
                      {groupConfirmed} confirmados
                    </span>

                    <div className="w-8 h-8 rounded-lg bg-[#0B0F10] border border-[#1E272B] flex items-center justify-center text-gray-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Accordion Body: Participants List */}
                {isExpanded && (
                  <div className="border-t border-[#1E272B] bg-[#070A0B] p-4 sm:p-5 space-y-4">
                    {visiblePresences.length === 0 ? (
                      <div className="py-6 px-4 text-center rounded-xl bg-[#0B0F10] border border-[#1E272B]/60 space-y-2">
                        <UserCheck className="w-8 h-8 text-gray-600 mx-auto" />
                        <p className="text-xs font-bold text-gray-300">
                          Nenhuma presença confirmada nesta call ainda.
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Os membros que confirmarem presença através do formulário aparecerão aqui.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-[#1E272B] bg-[#0B0F10]">
                        <table className="w-full text-left text-xs text-gray-300">
                          <thead className="bg-[#12181B] text-gray-400 font-bold border-b border-[#1E272B] uppercase text-[10px]">
                            <tr>
                              <th className="py-2.5 px-3">Participante</th>
                              <th className="py-2.5 px-3">Cargo / Área</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Confirmado em</th>
                              <th className="py-2.5 px-3 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1E272B]">
                            {visiblePresences.map((p) => (
                              <tr key={p.id} className="hover:bg-[#151D21] transition-colors">
                                <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#16221D] border border-[#22E025]/40 text-[#22E025] flex items-center justify-center text-[10px] uppercase font-bold">
                                    {p.name.charAt(0)}
                                  </div>
                                  {p.name}
                                </td>
                                <td className="py-3 px-3 text-gray-400">{p.role}</td>
                                <td className="py-3 px-3">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-[#153A2D] text-[#22E025] border-[#22E025]/30">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Confirmado
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-[10px] font-mono text-gray-500">
                                  {p.timestamp
                                    ? new Date(p.timestamp).toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleStartEdit(p)}
                                      title="Editar Presença"
                                      className="px-2.5 py-1 rounded-lg bg-[#12181B] hover:bg-[#1E272B] border border-[#232D32] hover:border-[#22E025]/50 text-gray-300 hover:text-[#22E025] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Editar</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Deseja remover a presença de "${p.name}"?`)) {
                                          handleDelete(p.id);
                                        }
                                      }}
                                      disabled={deletingId === p.id}
                                      title="Excluir Presença"
                                      className="p-1.5 rounded-lg bg-[#12181B] hover:bg-rose-950/60 border border-[#232D32] hover:border-rose-500/50 text-gray-400 hover:text-rose-400 transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Presence Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="adsata-card max-w-md w-full p-6 space-y-5 border-[#22E025]/50 shadow-[0_0_40px_rgba(34,224,37,0.2)] relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E272B]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#22E025]" />
                <h3 className="text-base font-extrabold text-white">Editar Presença</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg hover:bg-[#1E272B] text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-gray-300">
                  Nome do Participante <span className="text-[#22E025]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0B0F10] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22E025]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-gray-300">
                  Cargo / Área
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-[#0B0F10] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22E025] cursor-pointer"
                >
                  <option value="Editor de Criativo">Editor de Criativo</option>
                  <option value="Copy de Criativo">Copy de Criativo</option>
                  <option value="Copy de VSL">Copy de VSL</option>
                  <option value="Editor de VSL">Editor de VSL</option>
                  <option value="Gestor de Tráfego">Gestor de Tráfego</option>
                  <option value="Head">Head</option>
                  <option value="Membro da Equipe">Membro da Equipe</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E272B]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#12181B] hover:bg-[#1E272B] border border-[#232D32] text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editName.trim()}
                  className="px-4 py-2 rounded-xl bg-[#22E025] hover:bg-[#1fc822] text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? "Salvando..." : "Salvar Alterações"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
