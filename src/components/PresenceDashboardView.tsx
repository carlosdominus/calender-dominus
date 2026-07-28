import React, { useState, useEffect } from "react";
import { Users, CheckCircle2, Clock, AlertTriangle, Search } from "lucide-react";
import { PresenceConfirmation } from "../types";

export const PresenceDashboardView: React.FC = () => {
  const [presences, setPresences] = useState<PresenceConfirmation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPresences = async () => {
    try {
      const res = await fetch("/api/presences");
      if (res.ok) {
        const data = await res.json();
        setPresences(data);
      }
    } catch (err) {
      console.error("Erro ao carregar presenças:", err);
    }
  };

  useEffect(() => {
    fetchPresences();
  }, []);

  const filtered = presences.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmedCount = presences.filter(p => p.status === "confirmed").length;
  const lateCount = presences.filter(p => p.status === "late").length;
  const absentCount = presences.filter(p => p.status === "absent").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#22E025]" />
            Lista de Presença Confirmada
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Membros confirmados nas reuniões recorrentes (14:30h).
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-[#153A2D] text-[#22E025] border border-[#22E025]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {confirmedCount} Confirmados
          </span>
          {lateCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lateCount} Atrasos
            </span>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="adsata-card p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar membro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F10] border border-[#1E272B] focus:border-[#22E025] rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0B0F10] text-gray-400 font-bold border-b border-[#1E272B] uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Nome</th>
                <th className="py-2.5 px-3">Cargo</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Observação</th>
                <th className="py-2.5 px-3">Horário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E272B]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#12181B] transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 text-gray-400">{item.role}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          item.status === "confirmed"
                            ? "bg-[#153A2D] text-[#22E025] border-[#22E025]/30"
                            : item.status === "late"
                            ? "bg-amber-950 text-amber-400 border-amber-500/30"
                            : "bg-rose-950 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {item.status === "confirmed" ? "Confirmado" : item.status === "late" ? "Atraso" : "Ausente"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 max-w-xs truncate">
                      {item.notes || "—"}
                    </td>
                    <td className="py-3 px-3 text-[10px] font-mono text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
