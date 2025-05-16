import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRaceSchedule, Race } from "@/services/f1Service";
import { RaceCard } from "@/components/RaceCard";
import { RaceDetails } from "@/components/RaceDetails";
import { DriverStandingsTable } from "@/components/DriverStandingsTable";
import { ConstructorStandingsTable } from "@/components/ConstructorStandingsTable";
import { SkeletonCard } from "@/components/SkeletonCard";
import { CalendarIcon, TrophyIcon, CarIcon } from "lucide-react";

const Index = () => {
  const { schedule, loading, error } = useRaceSchedule();
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  // Handle race card click
  const handleRaceClick = (race: Race) => {
    setSelectedRace(race);
    setDetailsOpen(true);
  };

  // Check if a race is in the past
  const isRacePast = (race: Race) => {
    const today = new Date();
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
    return raceDate < today;
  };

  // Split races into past and upcoming
  const pastRaces = schedule.filter(isRacePast);
  const upcomingRaces = schedule.filter(race => !isRacePast(race));

  return (
    <div className="min-h-screen bg-gradient-to-b from-f1-dark to-[#1a1a1a] text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-f1-dark to-[#1E1E1E] border-b border-gray-800">
        <div className="container mx-auto py-6">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-f1-red">f1</span>.stvr.cz
            </h1>
            <p className="text-gray-300 mt-2 text-lg">intuitivní kalendář závodů a výsledky</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-10 px-4 md:px-6">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="w-full md:w-auto bg-black/40 backdrop-blur-sm border border-gray-800 rounded-full mb-8 p-1">
            <TabsTrigger value="calendar" className="flex items-center gap-2 rounded-full data-[state=active]:bg-f1-red data-[state=active]:text-white">
              <CalendarIcon className="h-4 w-4" />
              <span>Kalendář závodů</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2 rounded-full data-[state=active]:bg-f1-red data-[state=active]:text-white">
              <TrophyIcon className="h-4 w-4" />
              <span>Pořadí jezdců</span>
            </TabsTrigger>
            <TabsTrigger value="constructors" className="flex items-center gap-2 rounded-full data-[state=active]:bg-f1-red data-[state=active]:text-white">
              <CarIcon className="h-4 w-4" />
              <span>Pořadí týmů</span>
            </TabsTrigger>
          </TabsList>

          {/* Race Calendar Tab */}
          <TabsContent value="calendar">
            {error && (
              <div className="p-6 rounded-xl bg-red-900/20 border border-red-900 text-center">
                <p className="text-red-400">{error}</p>
                <p className="text-gray-400 text-sm mt-1">Nepodařilo se načíst data o závodech. Zkuste to prosím později.</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <div>
                {/* Season indicator */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white">Sezóna Formule 1 2025</h2>
                  <p className="text-gray-300">Kompletní kalendář závodů a výsledky</p>
                </div>

                {/* Upcoming races section */}
                {upcomingRaces.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                      <div className="w-1.5 h-8 bg-f1-red mr-3 rounded-full"></div>
                      Nadcházející závody
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingRaces.map((race) => (
                        <RaceCard
                          key={race.round}
                          race={race}
                          onClick={() => handleRaceClick(race)}
                          isPast={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past races section */}
                {pastRaces.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                      <div className="w-1.5 h-8 bg-gray-500 mr-3 rounded-full"></div>
                      Dokončené závody
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pastRaces.map((race) => (
                        <RaceCard
                          key={race.round}
                          race={race}
                          onClick={() => handleRaceClick(race)}
                          isPast={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No races fallback */}
                {!loading && !error && schedule.length === 0 && (
                  <div className="text-center py-16 bg-black/20 rounded-xl border border-gray-800">
                    <p className="text-gray-300">Pro sezónu 2025 zatím nejsou k dispozici žádná data o závodech.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Driver Standings Tab */}
          <TabsContent value="drivers">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <div className="w-1.5 h-8 bg-f1-red mr-3 rounded-full"></div>
              Šampionát jezdců 2025
            </h2>
            <DriverStandingsTable />
          </TabsContent>

          {/* Constructor Standings Tab */}
          <TabsContent value="constructors">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <div className="w-1.5 h-8 bg-f1-red mr-3 rounded-full"></div>
              Pohár konstruktérů 2025
            </h2>
            <ConstructorStandingsTable />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-gray-800 py-6 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-gray-300 text-sm">
            Data poskytuje <a href="https://ergast.com/mrd/" target="_blank" rel="noopener noreferrer" className="text-f1-red hover:underline">Ergast F1 API</a>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            f1.stvr.cz není spojen s Formula 1, FIA ani Liberty Media
          </p>
        </div>
      </footer>

      {/* Race details modal */}
      <RaceDetails
        race={selectedRace}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
};

export default Index;
