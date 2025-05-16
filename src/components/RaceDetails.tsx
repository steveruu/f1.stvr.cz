import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchRaceResults, Race } from "@/services/f1Service";
import { format, parseISO, isValid } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarIcon, MapPinIcon, FlagIcon, ClockIcon, TrophyIcon, InfoIcon } from "lucide-react";

interface RaceDetailsProps {
  race: Race | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RaceDetails({ race, isOpen, onClose }: RaceDetailsProps) {
  const [raceResults, setRaceResults] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRaceResults = async () => {
      if (!race) return;

      // Check if the race date has passed to fetch results
      try {
        const today = new Date();
        const raceDate = parseISO(`${race.date}T${race.time || '00:00:00Z'}`);

        if (isValid(raceDate) && raceDate < today) {
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
        console.error("Error parsing race date:", err);
      }
    };

    if (isOpen && race) {
      getRaceResults();
    }
  }, [isOpen, race]);

  if (!race) return null;

  // TBA
  let formattedDate = "Bude oznámeno";
  let formattedTime = "Bude oznámeno";
  let isPast = false;

  try {
    if (race.date) {
      const dateStr = `${race.date}T${race.time || '00:00:00Z'}`;
      const raceDate = parseISO(dateStr);

      if (isValid(raceDate)) {
        formattedDate = format(raceDate, "EEEE d. MMMM yyyy", { locale: cs });
        formattedTime = race.time ? format(raceDate, "HH:mm", { locale: cs }) : 'Bude oznámeno';

        // Check if race is in the past
        const today = new Date();
        isPast = raceDate < today;
      }
    }
  } catch (error) {
    console.error("Error formatting race date:", error);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-b from-f1-dark to-[#1a1a1a] text-white border-gray-800 max-w-3xl rounded-xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2" variant={isPast ? "secondary" : "default"}
                className={`${isPast ? 'bg-gray-700' : 'bg-f1-red'} text-white mb-2`}>
                {isPast ? "Dokončeno" : "Nadcházející"}
              </Badge>
              <DialogTitle className="text-2xl font-bold">{race.raceName}</DialogTitle>
              <p className="text-gray-300 mt-1">{race.Circuit.circuitName}</p>
            </div>
            <Badge className="bg-f1-red">Kolo {race.round}</Badge>
          </div>
        </DialogHeader>

        <div className="flex items-center mb-4 text-gray-300 bg-black/20 rounded-md p-2.5">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{formattedDate} • {formattedTime}</span>
        </div>

        <Tabs defaultValue="schedule" className="mt-2">
          <TabsList className="bg-black/40 border border-gray-800 rounded-lg mb-4 p-1">
            <TabsTrigger value="schedule" className="rounded-md data-[state=active]:bg-f1-red data-[state=active]:text-white">
              <ClockIcon className="h-4 w-4 mr-1.5" />
              Program
            </TabsTrigger>
            <TabsTrigger value="circuit" className="rounded-md data-[state=active]:bg-f1-red data-[state=active]:text-white">
              <MapPinIcon className="h-4 w-4 mr-1.5" />
              Okruh
            </TabsTrigger>
            {isPast && (
              <TabsTrigger value="results" className="rounded-md data-[state=active]:bg-f1-red data-[state=active]:text-white">
                <TrophyIcon className="h-4 w-4 mr-1.5" />
                Výsledky
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="schedule" className="pt-2">
            <h4 className="font-semibold text-lg mb-4">Program závodního víkendu</h4>
            <div className="space-y-3">
              {race.FirstPractice && (
                <EventItem
                  title="1. trénink"
                  date={race.FirstPractice.date}
                  time={race.FirstPractice.time}
                />
              )}
              {race.SecondPractice && (
                <EventItem
                  title="2. trénink"
                  date={race.SecondPractice.date}
                  time={race.SecondPractice.time}
                />
              )}
              {race.ThirdPractice && (
                <EventItem
                  title="3. trénink"
                  date={race.ThirdPractice.date}
                  time={race.ThirdPractice.time}
                />
              )}
              {race.Sprint && (
                <EventItem
                  title="Sprint"
                  date={race.Sprint.date}
                  time={race.Sprint.time}
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

          {isPast && (
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
                      {raceResults.Results.map((result: any) => (
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

function EventItem({ title, date, time, highlight = false }) {
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

  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${highlight ? 'bg-f1-red/10 border border-f1-red/20' : 'bg-black/20 border border-gray-800'}`}>
      <div className="flex items-center">
        <div className={`w-1.5 h-10 ${highlight ? 'bg-f1-red' : 'bg-gray-600'} rounded-full mr-3`}></div>
        <span className={`font-medium ${highlight ? 'text-f1-red' : 'text-white'}`}>{title}</span>
      </div>
      <div className="text-right">
        <span className="block text-sm text-gray-400">{formattedDate}</span>
        <span className="block text-sm font-medium">{formattedTime}</span>
      </div>
    </div>
  );
}
