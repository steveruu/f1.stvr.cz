
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRaceSchedule, Race } from "@/services/f1Service";
import { RaceCard } from "@/components/RaceCard";
import { RaceDetails } from "@/components/RaceDetails";
import { DriverStandingsTable } from "@/components/DriverStandingsTable";
import { ConstructorStandingsTable } from "@/components/ConstructorStandingsTable";
import { SkeletonCard } from "@/components/SkeletonCard";

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
    <div className="min-h-screen bg-f1-dark text-white">
      {/* Header */}
      <header className="bg-f1-gray border-b border-gray-800">
        <div className="container mx-auto py-5">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold">
              <span className="text-f1-red">F1</span> Race Tracker
            </h1>
            <p className="text-gray-400 mt-1">Follow the Formula 1 season and standings</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4 md:px-0">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="w-full md:w-auto bg-f1-gray border-gray-800 mb-6">
            <TabsTrigger value="calendar" className="flex-1 md:flex-none">Race Calendar</TabsTrigger>
            <TabsTrigger value="drivers" className="flex-1 md:flex-none">Driver Standings</TabsTrigger>
            <TabsTrigger value="constructors" className="flex-1 md:flex-none">Constructor Standings</TabsTrigger>
          </TabsList>

          {/* Race Calendar Tab */}
          <TabsContent value="calendar">
            {error && (
              <div className="p-4 rounded bg-red-900/20 border border-red-900 text-center">
                <p className="text-red-400">{error}</p>
                <p className="text-gray-400 text-sm mt-1">Unable to load race data. Please try again later.</p>
              </div>
            )}
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <div>
                {/* Season indicator */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">2025 Formula 1 Season</h2>
                  <p className="text-gray-400">View the complete race calendar and results</p>
                </div>
                
                {/* Upcoming races section */}
                {upcomingRaces.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <div className="w-2 h-6 bg-f1-red mr-2"></div>
                      Upcoming Races
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <div className="w-2 h-6 bg-gray-500 mr-2"></div>
                      Completed Races
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  <div className="text-center py-10">
                    <p className="text-gray-400">No race data available for the 2025 season yet.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Driver Standings Tab */}
          <TabsContent value="drivers">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="w-2 h-6 bg-f1-red mr-2"></div>
              2025 Driver Championship Standings
            </h2>
            <DriverStandingsTable />
          </TabsContent>

          {/* Constructor Standings Tab */}
          <TabsContent value="constructors">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="w-2 h-6 bg-f1-red mr-2"></div>
              2025 Constructor Championship Standings
            </h2>
            <ConstructorStandingsTable />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-f1-gray border-t border-gray-800 py-5 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 text-sm">
            Data provided by the <a href="https://ergast.com/mrd/" target="_blank" rel="noopener noreferrer" className="text-f1-red hover:underline">Ergast F1 API</a>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            F1 Race Tracker is not affiliated with Formula 1, FIA, or Liberty Media
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
