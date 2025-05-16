import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid } from "date-fns";
import type { Race } from "@/services/f1Service";
import { CalendarIcon } from "lucide-react";

interface RaceCardProps {
  race: Race;
  onClick: () => void;
  isPast: boolean;
}

export function RaceCard({ race, onClick, isPast }: RaceCardProps) {
  // Format date for display, handling potential invalid dates
  let formattedDate = "TBA";
  let formattedTime = "TBA";
  
  try {
    if (race.date) {
      // Parse and validate the date
      const dateStr = `${race.date}T${race.time || '00:00:00Z'}`;
      const raceDate = parseISO(dateStr);
      
      if (isValid(raceDate)) {
        formattedDate = format(raceDate, "MMM d, yyyy");
        formattedTime = race.time ? format(raceDate, "h:mm a") : 'TBA';
      }
    }
  } catch (error) {
    console.error("Error formatting race date:", error);
    // Keep default values if parsing fails
  }

  return (
    <Card 
      className="race-card bg-f1-gray border-gray-800 shadow-md hover:cursor-pointer p-0 overflow-hidden"
      onClick={onClick}
    >
      <div className="h-2 bg-f1-red w-full"></div>
      <CardContent className="p-4 pt-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm">{race.Circuit.Location.country}</p>
            <h3 className="text-white font-bold text-lg">{race.raceName}</h3>
            <p className="text-gray-300 text-sm">{race.Circuit.circuitName}</p>
          </div>
          <Badge variant={isPast ? "secondary" : "default"} className={isPast ? "bg-gray-600" : "bg-f1-red"}>
            {isPast ? "Completed" : "Round " + race.round}
          </Badge>
        </div>
        <div className="flex items-center mt-3 text-gray-300">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span className="text-sm">{formattedDate} - {formattedTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}
