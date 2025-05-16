import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchRaceResults, Race } from "@/services/f1Service";
import { format, parseISO, isValid, isWithinInterval, isSameDay } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarIcon, MapPinIcon, FlagIcon, ClockIcon, TrophyIcon, InfoIcon } from "lucide-react";

interface RaceDetailsProps {
  race: Race | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RaceResult {
  position: string;
  Driver: {
    code: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    name: string;
  };
  Time?: {
    time: string;
  };
  status?: string;
}

interface RaceResultsResponse {
  Results: RaceResult[];
}

function getEventDateRange(race: Race): { startDate: Date | null; endDate: Date | null } {
  const dates = [
    race.FirstPractice && parseISO(`${race.FirstPractice.date}T${race.FirstPractice.time || '00:00:00Z'}`),
    race.SecondPractice && parseISO(`${race.SecondPractice.date}T${race.SecondPractice.time || '00:00:00Z'}`),
    race.ThirdPractice && parseISO(`${race.ThirdPractice.date}T${race.ThirdPractice.time || '00:00:00Z'}`),
    race.SprintQualifying && parseISO(`${race.SprintQualifying.date}T${race.SprintQualifying.time || '00:00:00Z'}`),
    race.Sprint && parseISO(`${race.Sprint.date}T${race.Sprint.time || '00:00:00Z'}`),
    race.Qualifying && parseISO(`${race.Qualifying.date}T${race.Qualifying.time || '00:00:00Z'}`),
    parseISO(`${race.date}T${race.time || '00:00:00Z'}`),
  ].filter((date): date is Date => date !== null && isValid(date));

  if (dates.length === 0) return { startDate: null, endDate: null };

  return {
    startDate: dates.reduce((min, date) => date < min ? date : min),
    endDate: dates.reduce((max, date) => date > max ? date : max),
  };
}

function getRaceStatus(startDate: Date | null, endDate: Date | null): {
  status: "past" | "current" | "upcoming";
  label: string;
  className: string;
} {
  const now = new Date();

  if (!startDate || !endDate) {
    return {
      status: "upcoming",
      label: "Bude oznámeno",
      className: "bg-f1-red",
    };
  }

  if (endDate < now) {
    return {
      status: "past",
      label: "Dokončeno",
      className: "bg-gray-700",
    };
  }

  if (isWithinInterval(now, { start: startDate, end: endDate })) {
    return {
      status: "current",
      label: "Právě probíhá",
      className: "bg-f1-red",
    };
  }

  return {
    status: "upcoming",
    label: "Nadcházející",
    className: "bg-f1-red",
  };
}

export function RaceDetails({ race, isOpen, onClose }: RaceDetailsProps) {
  const [raceResults, setRaceResults] = useState<RaceResultsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRaceResults = async () => {
      if (!race) return;

      const { endDate } = getEventDateRange(race);
      if (!endDate) return;

      // Check if the race date has passed to fetch results
      try {
        const today = new Date();
        if (endDate < today) {
          try {
            setLoading(true);
            const results = await fetchRaceResults(race.season, race.round);
            setRaceResults(results);
            setLoading(false);
          } catch (err) {
            setError("Nepodařilo se načíst výsledky závodu");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error checking race date:", err);
      }
    };

    if (isOpen && race) {
      getRaceResults();
    }
  }, [isOpen, race]);

  if (!race) return null;

  const { startDate, endDate } = getEventDateRange(race);
  const { status, label, className } = getRaceStatus(startDate, endDate);
  const isSprintWeekend = !!race.Sprint; // Determine if it's a sprint weekend

  let formattedDateRange = "Bude oznámeno";

  try {
    if (startDate && endDate) {
      if (isSameDay(startDate, endDate)) {
        formattedDateRange = format(startDate, "EEEE d. MMMM yyyy", { locale: cs });
      } else {
        const startStr = format(startDate, "d.", { locale: cs });
        const endStr = format(endDate, "EEEE d. MMMM yyyy", { locale: cs });
        formattedDateRange = `${startStr} - ${endStr}`;
      }
    }
  } catch (error) {
    console.error("Error formatting race date range:", error);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`bg-gradient-to-b from-f1-dark to-[#1a1a1a] text-white border-gray-800 max-w-3xl rounded-xl ${status === 'current' ? 'bg-f1-red/20' : ''}`}>
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge className={`${className} text-white mb-2`}>
                {label}
              </Badge>
              <DialogTitle className="text-2xl font-bold">{race.raceName}</DialogTitle>
              <p className="text-gray-300 mt-1">{race.Circuit.circuitName}</p>
            </div>
            <Badge className="bg-f1-red">Kolo {race.round}</Badge>
          </div>
        </DialogHeader>

        <div className="flex items-center mb-4 text-gray-300 bg-black/20 rounded-md p-2.5">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{formattedDateRange}</span>
        </div>

        <Tabs defaultValue="schedule" className="mt-4">
          <TabsList className="bg-black/40 border border-gray-800 rounded-lg mb-4 p-1">
            <TabsTrigger value="schedule" className="rounded-md data-[state=active]:bg-f1-red data-[state=active]:text-white">
              <ClockIcon className="h-4 w-4 mr-1.5" />
              Program
            </TabsTrigger>
            <TabsTrigger value="circuit" className="rounded-md data-[state=active]:bg-f1-red data-[state=active]:text-white">
              <MapPinIcon className="h-4 w-4 mr-1.5" />
              Okruh
            </TabsTrigger>
            {status === "past" && (
              <TabsTrigger value="results" className="rounded-md data-[state=active]:bg-f1-red data-[state=active]:text-white">
                <TrophyIcon className="h-4 w-4 mr-1.5" />
                Výsledky
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="schedule">
            <h4 className="font-semibold text-lg mb-4">Program závodního víkendu</h4>
            <div className="space-y-3">
              {race.FirstPractice && (
                <EventItem
                  title="1. trénink"
                  date={race.FirstPractice.date}
                  time={race.FirstPractice.time}
                />
              )}

              {isSprintWeekend && race.SprintQualifying && (
                <EventItem
                  title="Kvalifikace pro Sprint"
                  date={race.SprintQualifying.date}
                  time={race.SprintQualifying.time}
                />
              )}

              {isSprintWeekend && race.Sprint && (
                <EventItem
                  title="Sprint"
                  date={race.Sprint.date}
                  time={race.Sprint.time}
                />
              )}

              {!isSprintWeekend && race.SecondPractice && (
                <EventItem
                  title="2. trénink"
                  date={race.SecondPractice.date}
                  time={race.SecondPractice.time}
                />
              )}
              {!isSprintWeekend && race.ThirdPractice && (
                <EventItem
                  title="3. trénink"
                  date={race.ThirdPractice.date}
                  time={race.ThirdPractice.time}
                />
              )}

              {race.Qualifying && (
                <EventItem
                  title="Kvalifikace"
                  date={race.Qualifying.date}
                  time={race.Qualifying.time}
                  highlight
                />
              )}

              <EventItem
                title="Závod"
                date={race.date}
                time={race.time}
                highlight
              />
            </div>
          </TabsContent>

          <TabsContent value="circuit">
            <h4 className="font-semibold text-lg mb-4">Informace o okruhu</h4>
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-md">
                  <MapPinIcon className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Lokalita</p>
                  <p className="font-medium">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</p>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-md">
                  <InfoIcon className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Oficiální stránky</p>
                  <a
                    href={race.Circuit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-f1-red hover:underline font-medium"
                  >
                    Navštívit stránky
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-gray-300 mb-3 font-medium">Mapa okruhu</p>
                <div className="aspect-video bg-black/30 rounded-lg border border-gray-800 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-6">
                    <MapPinIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500">Vizualizace okruhu by se zobrazila zde</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {status === "past" && (
            <TabsContent value="results">
              <h4 className="font-semibold text-lg mb-4">Výsledky závodu</h4>
              {loading && <p className="text-gray-400">Načítání výsledků...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {!loading && !error && !raceResults && (
                <p className="text-gray-400">Výsledky zatím nejsou k dispozici</p>
              )}
              {!loading && !error && raceResults && raceResults.Results && (
                <div className="overflow-x-auto bg-black/20 rounded-lg border border-gray-800">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Poz</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Jezdec</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Tým</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Čas/Rozdíl</th>
                      </tr>
                    </thead>
                    <tbody>
                      {raceResults.Results.map((result: RaceResult) => (
                        <tr key={result.position} className="border-b border-gray-800 last:border-0 hover:bg-white/5">
                          <td className="py-3 px-4">{result.position}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold mr-2 text-white">{result.Driver.code}</span>
                            {result.Driver.givenName} {result.Driver.familyName}
                          </td>
                          <td className="py-3 px-4">{result.Constructor.name}</td>
                          <td className="py-3 px-4 text-right">
                            {result.Time ? result.Time.time : (result.status || 'DNF')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function EventItem({ title, date, time, highlight = false }: {
  title: string;
  date?: string;
  time?: string;
  highlight?: boolean;
}) {
  let formattedDate = "Bude oznámeno";
  let formattedTime = "Bude oznámeno";

  try {
    if (date) {
      const eventDate = parseISO(`${date}T${time || '00:00:00Z'}`);
      if (isValid(eventDate)) {
        formattedDate = format(eventDate, "EEEE, d. MMMM", { locale: cs });
        formattedTime = time ? format(eventDate, "HH:mm", { locale: cs }) : 'Bude oznámeno';
      }
    }
  } catch (error) {
    console.error("Error formatting event date:", error);
  }

  const isCurrentEvent = () => {
    if (!date || !time) return false;
    const eventDate = parseISO(`${date}T${time}`);
    if (!isValid(eventDate)) return false;

    const eventEnd = new Date(eventDate);
    eventEnd.setHours(eventEnd.getHours() + 2); // Assume events last 2 hours

    return isWithinInterval(new Date(), { start: eventDate, end: eventEnd });
  };

  const isCurrent = isCurrentEvent();

  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${isCurrent ? 'bg-f1-red/20 border border-f1-red/20' :
      highlight ? 'bg-f1-red/10 border border-f1-red/20' :
        'bg-black/20 border border-gray-800'
      }`}>
      <div className="flex items-center">
        <div className={`w-1.5 h-10 ${isCurrent ? 'bg-f1-red' :
          highlight ? 'bg-f1-red' :
            'bg-gray-600'
          } rounded-full mr-3`}></div>
        <span className={`font-medium ${isCurrent ? 'text-f1-red' :
          highlight ? 'text-f1-red' :
            'text-white'
          }`}>{title}</span>
      </div>
      <div className="text-right">
        <span className="block text-sm text-gray-400">{formattedDate}</span>
        <span className="block text-sm font-medium">{formattedTime}</span>
      </div>
    </div>
  );
}
