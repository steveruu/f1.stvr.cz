
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchRaceResults, Race } from "@/services/f1Service";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
      const today = new Date();
      const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
      
      if (raceDate < today) {
        try {
          setLoading(true);
          const results = await fetchRaceResults(race.season, race.round);
          setRaceResults(results);
          setLoading(false);
        } catch (err) {
          setError("Unable to fetch race results");
          setLoading(false);
        }
      }
    };

    if (isOpen && race) {
      getRaceResults();
    }
  }, [isOpen, race]);

  if (!race) return null;

  // Format dates for display
  const raceDate = parseISO(`${race.date}T${race.time || '00:00:00Z'}`);
  const formattedDate = format(raceDate, "EEEE, MMMM d, yyyy");
  const formattedTime = race.time ? format(raceDate, "h:mm a") : 'TBA';

  // Check if race is in the past
  const today = new Date();
  const isPast = raceDate < today;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-f1-gray text-white border-gray-700 max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2" variant={isPast ? "secondary" : "default"}>
                {isPast ? "Completed" : "Upcoming"}
              </Badge>
              <DialogTitle className="text-2xl font-bold">{race.raceName}</DialogTitle>
              <p className="text-gray-300 mt-1">{race.Circuit.circuitName}</p>
            </div>
            <Badge className="bg-f1-red">Round {race.round}</Badge>
          </div>
        </DialogHeader>

        <div className="flex items-center mb-4 text-gray-300">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>{formattedDate} at {formattedTime}</span>
        </div>

        <Tabs defaultValue="schedule">
          <TabsList className="bg-f1-dark border-gray-700 mb-4">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="circuit">Circuit</TabsTrigger>
            {isPast && <TabsTrigger value="results">Results</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="schedule" className="pt-2">
            <h4 className="font-semibold text-lg mb-3">Weekend Schedule</h4>
            <div className="space-y-4">
              {race.FirstPractice && (
                <EventItem 
                  title="Practice 1" 
                  date={race.FirstPractice.date} 
                  time={race.FirstPractice.time} 
                />
              )}
              {race.SecondPractice && (
                <EventItem 
                  title="Practice 2" 
                  date={race.SecondPractice.date} 
                  time={race.SecondPractice.time} 
                />
              )}
              {race.ThirdPractice && (
                <EventItem 
                  title="Practice 3" 
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
                  title="Qualifying" 
                  date={race.Qualifying.date} 
                  time={race.Qualifying.time} 
                  highlight
                />
              )}
              <EventItem 
                title="Race Day" 
                date={race.date} 
                time={race.time} 
                highlight
              />
            </div>
          </TabsContent>

          <TabsContent value="circuit">
            <h4 className="font-semibold text-lg mb-3">Circuit Information</h4>
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-1">Location</p>
                <p className="font-medium">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</p>
              </div>
              
              <div>
                <p className="text-gray-300 mb-1">Official Website</p>
                <a 
                  href={race.Circuit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-f1-red hover:underline font-medium"
                >
                  Visit Website
                </a>
              </div>

              <div className="pt-2">
                <p className="text-gray-300 mb-3">Circuit Map</p>
                <div className="aspect-video bg-f1-dark rounded flex items-center justify-center">
                  <p className="text-gray-500">Circuit map visualization would appear here</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {isPast && (
            <TabsContent value="results">
              <h4 className="font-semibold text-lg mb-3">Race Results</h4>
              {loading && <p className="text-gray-400">Loading results...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {!loading && !error && !raceResults && (
                <p className="text-gray-400">No results available yet</p>
              )}
              {!loading && !error && raceResults && (
                <p className="text-gray-400">Results would be displayed here</p>
                // In a real implementation, we would map through raceResults and display them
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for schedule items
function EventItem({ title, date, time, highlight = false }) {
  if (!date) return null;
  
  const eventDate = parseISO(`${date}T${time || '00:00:00Z'}`);
  const formattedDate = format(eventDate, "E, MMM d");
  const formattedTime = time ? format(eventDate, "h:mm a") : 'TBA';

  return (
    <div className={`flex justify-between items-center p-3 rounded ${highlight ? 'bg-f1-red bg-opacity-10 border border-f1-red border-opacity-20' : 'bg-f1-dark'}`}>
      <span className={`font-medium ${highlight ? 'text-f1-red' : 'text-white'}`}>{title}</span>
      <div className="text-right">
        <span className="block text-sm text-gray-300">{formattedDate}</span>
        <span className="block text-sm font-medium">{formattedTime}</span>
      </div>
    </div>
  );
}
