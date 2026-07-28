import { DayOfWeek, ScheduledCall, CallOccurrence } from "../types";

export const FIXED_CALL_SCHEDULE: ScheduledCall[] = [
  {
    id: "sched-segunda",
    dayOfWeek: "Segunda-feira",
    dayShort: "SEG",
    time: "16:00",
    topic: "Call de Alinhamento Semanal & Metas Adsata",
    host: "Time de Ops & Diretoria",
    description: "Reunião de início de semana para alinhamento de entregas, novos projetos e prioridades.",
  },
  {
    id: "sched-quarta",
    dayOfWeek: "Quarta-feira",
    dayShort: "QUA",
    time: "16:00",
    topic: "Review de Performance, Tráfego & Campanhas",
    host: "Time de Mídia & Analytics",
    description: "Análise mid-week de métricas de anúncios, ROI, otimização de campanhas e testes A/B.",
  },
  {
    id: "sched-sexta",
    dayOfWeek: "Sexta-feira",
    dayShort: "SEX",
    time: "16:00",
    topic: "Fechamento Semanal, Retrospectiva e Próximos Passos",
    host: "Gestão & Liderança",
    description: "Alinhamento final da semana, retrospectiva de resultados e planejamento da próxima rodada.",
  },
];

// Day mapping: 1 = Mon, 3 = Wed, 5 = Fri
const DAY_INDEX_MAP: Record<number, DayOfWeek> = {
  1: "Segunda-feira",
  3: "Quarta-feira",
  5: "Sexta-feira",
};

export function getUpcomingCalls(count: number = 6): CallOccurrence[] {
  const calls: CallOccurrence[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  
  let checkDate = new Date(now);
  // Start checking from today
  checkDate.setHours(0, 0, 0, 0);

  while (calls.length < count) {
    const dayOfWeekIndex = checkDate.getDay(); // 0 = Sun, 1 = Mon, 3 = Wed, 5 = Fri
    
    if (dayOfWeekIndex === 1 || dayOfWeekIndex === 3 || dayOfWeekIndex === 5) {
      const dayOfWeek = DAY_INDEX_MAP[dayOfWeekIndex];
      const callScheduleObj = FIXED_CALL_SCHEDULE.find(s => s.dayOfWeek === dayOfWeek);

      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, "0");
      const day = String(checkDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const isToday = checkDate.toDateString() === now.toDateString();
      
      // Calculate call status for today
      let status: "upcoming" | "in_progress" | "completed" = "upcoming";
      if (isToday) {
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const timeInMin = currentHour * 60 + currentMin;
        const callTimeInMin = 16 * 60; // 16:00 = 960 min

        if (timeInMin >= callTimeInMin && timeInMin <= callTimeInMin + 60) {
          status = "in_progress";
        } else if (timeInMin > callTimeInMin + 60) {
          status = "completed";
        } else {
          status = "upcoming";
        }
      } else if (checkDate < now && !isToday) {
        status = "completed";
      }

      // Format date in Portuguese
      const formattedDate = checkDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      // Capitalize weekday
      const capitalizedFormattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      calls.push({
        id: `call-${dateStr}`,
        date: dateStr,
        formattedDate: capitalizedFormattedDate,
        dayOfWeek,
        time: "16:00",
        topic: callScheduleObj?.topic || "Call Semanal Adsata",
        host: callScheduleObj?.host || "Equipe Adsata",
        isToday,
        status,
      });
    }

    // Move to next day
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return calls;
}

export function getTimeUntilNextCall(): { hours: number; minutes: number; seconds: number; isCallToday: boolean; nextCall: CallOccurrence } {
  const upcomingCalls = getUpcomingCalls(1);
  const nextCall = upcomingCalls[0];
  const now = new Date();

  const [year, month, day] = nextCall.date.split("-").map(Number);
  const callTargetTime = new Date(year, month - 1, day, 16, 0, 0, 0);

  let diffMs = callTargetTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isCallToday: nextCall.isToday,
      nextCall,
    };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * 1000 * 60;
  const seconds = Math.floor(diffMs / 1000);

  return {
    hours,
    minutes,
    seconds,
    isCallToday: nextCall.isToday,
    nextCall,
  };
}
