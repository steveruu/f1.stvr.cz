import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRaceSchedule, Race } from "@/services/f1Service";
import { RaceCard } from "@/components/RaceCard";
import { RaceDetails } from "@/components/RaceDetails";
import { DriverStandingsTable } from "@/components/DriverStandingsTable";
import { ConstructorStandingsTable } from "@/components/ConstructorStandingsTable";
import { SkeletonCard } from "@/components/SkeletonCard";
import { CalendarIcon, TrophyIcon, CarIcon } from "lucide-react";
import { isWithinInterval, parseISO } from "date-fns";

const Index = () => {
  const { schedule, loading, error } = useRaceSchedule();
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("calendar");

  // Handle race card click
  const handleRaceClick = (race: Race) => {
    setSelectedRace(race);
    setDetailsOpen(true);
  };

  // Get event date range for a race
  const getEventDateRange = (race: Race) => {
    const dates = [
      race.FirstPractice && parseISO(`${race.FirstPractice.date}T${race.FirstPractice.time || '00:00:00Z'}`),
      race.SecondPractice && parseISO(`${race.SecondPractice.date}T${race.SecondPractice.time || '00:00:00Z'}`),
      race.ThirdPractice && parseISO(`${race.ThirdPractice.date}T${race.ThirdPractice.time || '00:00:00Z'}`),
      race.Qualifying && parseISO(`${race.Qualifying.date}T${race.Qualifying.time || '00:00:00Z'}`),
      race.Sprint && parseISO(`${race.Sprint.date}T${race.Sprint.time || '00:00:00Z'}`),
      parseISO(`${race.date}T${race.time || '00:00:00Z'}`),
    ].filter((date): date is Date => date !== null);

    if (dates.length === 0) return { startDate: null, endDate: null };

    return {
      startDate: dates.reduce((min, date) => date < min ? date : min),
      endDate: dates.reduce((max, date) => date > max ? date : max),
    };
  };

  // Check if a race is in the past
  const isRacePast = (race: Race) => {
    const { endDate } = getEventDateRange(race);
    if (!endDate) return false;
    return endDate < new Date();
  };

  // Check if a race is currently happening
  const isRaceCurrent = (race: Race) => {
    const { startDate, endDate } = getEventDateRange(race);
    if (!startDate || !endDate) return false;
    const now = new Date();
    return isWithinInterval(now, { start: startDate, end: endDate });
  };

  // Split races into past, current, and upcoming
  const pastRaces = schedule.filter(isRacePast);
  const currentRaces = schedule.filter(isRaceCurrent);
  const upcomingRaces = schedule.filter(race => !isRacePast(race) && !isRaceCurrent(race));

  // Handle tab change for mobile bottom navigation
  useEffect(() => {
    const handleTabChange = (tab: string) => {
      setActiveTab(tab);
    };

    document.addEventListener("tabChange", (e: CustomEvent<{ tab: string }>) => handleTabChange(e.detail.tab));
    return () => {
      document.removeEventListener("tabChange", (e: CustomEvent<{ tab: string }>) => handleTabChange(e.detail.tab));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-f1-dark to-[#1a1a1a] text-white relative flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-f1-dark to-[#1E1E1E] border-b border-gray-800 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="container mx-auto py-4 sm:py-6">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-f1-red">f1</span>.stvr.cz
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-5 sm:py-10 px-3 sm:px-6 flex-1 pb-20 sm:pb-10 overflow-x-hidden">
        <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tabs */}
          <div className="flex justify-center hidden sm:flex">
            <TabsList className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-full mb-8 p-1 w-auto">
              <TabsTrigger value="calendar" className="flex items-center gap-2 rounded-full data-[state=active]:bg-f1-red data-[state=active]:text-white">
                <CalendarIcon className="h-4 w-4" />
                <span>Závody</span>
              </TabsTrigger>
              <TabsTrigger value="drivers" className="flex items-center gap-2 rounded-full data-[state=active]:bg-f1-red data-[state=active]:text-white">
                <TrophyIcon className="h-4 w-4" />
                <span>Jezdci</span>
              </TabsTrigger>
              <TabsTrigger value="constructors" className="flex items-center gap-2 rounded-full data-[state=active]:bg-f1-red data-[state=active]:text-white">
                <CarIcon className="h-4 w-4" />
                <span>Týmy</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calendar" className="mt-0">
            {error && (
              <div className="p-4 sm:p-6 rounded-xl bg-red-900/20 border border-red-900 text-center">
                <p className="text-red-400">{error}</p>
                <p className="text-gray-400 text-sm mt-1">Nepodařilo se načíst data o závodech. Zkuste to prosím později.</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <div>
                {/* Season indicator */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Sezóna 2025</h2>
                  <p className="text-gray-300 text-sm sm:text-base">Kompletní kalendář závodů a výsledky</p>
                </div>

                {/* Current races section */}
                {currentRaces.length > 0 && (
                  <div className="mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center">
                      <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-f1-red mr-2 sm:mr-3 rounded-full"></div>
                      Právě probíhá
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {currentRaces.map((race) => (
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

                {/* Upcoming races section */}
                {upcomingRaces.length > 0 && (
                  <div className="mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center">
                      <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-f1-red mr-2 sm:mr-3 rounded-full"></div>
                      Nadcházející závody
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center">
                      <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gray-500 mr-2 sm:mr-3 rounded-full"></div>
                      Dokončené závody
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  <div className="text-center py-10 sm:py-16 bg-black/20 rounded-xl border border-gray-800">
                    <p className="text-gray-300">Pro sezónu 2025 zatím nejsou k dispozici žádná data o závodech.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Driver Standings Tab */}
          <TabsContent value="drivers" className="mt-0">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center">
              <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-f1-red mr-2 sm:mr-3 rounded-full"></div>
              Šampionát jezdců 2025
            </h2>
            <DriverStandingsTable />
          </TabsContent>

          {/* Constructor Standings Tab */}
          <TabsContent value="constructors" className="mt-0">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center">
              <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-f1-red mr-2 sm:mr-3 rounded-full"></div>
              Pohár konstruktérů 2025
            </h2>
            <ConstructorStandingsTable />
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 border-t border-gray-800 backdrop-blur-md sm:hidden z-20 pb-5">
        <div className="flex justify-around items-center py-3 px-2">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex flex-col items-center justify-center w-20 ${activeTab === 'calendar' ? 'text-f1-red bottom-nav-active' : 'text-gray-400'}`}
          >
            <CalendarIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Závody</span>
          </button>
          <button
            onClick={() => setActiveTab("drivers")}
            className={`flex flex-col items-center justify-center w-20 ${activeTab === 'drivers' ? 'text-f1-red bottom-nav-active' : 'text-gray-400'}`}
          >
            <TrophyIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Jezdci</span>
          </button>
          <button
            onClick={() => setActiveTab("constructors")}
            className={`flex flex-col items-center justify-center w-20 ${activeTab === 'constructors' ? 'text-f1-red bottom-nav-active' : 'text-gray-400'}`}
          >
            <CarIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Týmy</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-gray-800 py-4 sm:py-6 hidden sm:block">
        <div className="container mx-auto text-center">
          <p className="text-gray-300 text-sm">
            Data poskytuje <a href="https://api.jolpi.ca/ergast/" target="_blank" rel="noopener noreferrer" className="text-f1-red hover:underline">Jolpica F1 API</a>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            f1.stvr.cz není spojen s Formula 1, FIA, Jolpica ani Liberty Media
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
