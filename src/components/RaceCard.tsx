import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid } from "date-fns";
import { cs } from "date-fns/locale";
import type { Race } from "@/services/f1Service";
import { CalendarIcon, MapPinIcon } from "lucide-react";

interface RaceCardProps {
  race: Race;
  onClick: () => void;
  isPast: boolean;
}

const countryTranslations: { [key: string]: string } = {
  "Italy": "Itálie",
  "Monaco": "Monako",
  "Spain": "Španělsko",
  "UK": "Velká Británie",
  "United Kingdom": "Velká Británie",
  "USA": "USA",
  "United States": "Spojené státy americké",
  "Austria": "Rakousko",
  "Belgium": "Belgie",
  "Netherlands": "Nizozemsko",
  "Hungary": "Maďarsko",
  "Azerbaijan": "Ázerbájdžán",
  "Canada": "Kanada",
  "France": "Francie",
  "Germany": "Německo",
  "Japan": "Japonsko",
  "Mexico": "Mexiko",
  "Brazil": "Brazílie",
  "Australia": "Austrálie",
  "Bahrain": "Bahrajn",
  "Saudi Arabia": "Saúdská Arábie",
  "China": "Čína",
  "Singapore": "Singapur",
  "Qatar": "Katar",
  "UAE": "SAE",
  "United Arab Emirates": "Spojené arabské emiráty",
};

const countryFlags: { [key: string]: string } = {
  "Italy": "🇮🇹",
  "Monaco": "🇲🇨",
  "Spain": "🇪🇸",
  "UK": "🇬🇧",
  "United Kingdom": "🇬🇧",
  "USA": "🇺🇸",
  "United States": "🇺🇸",
  "Austria": "🇦🇹",
  "Belgium": "🇧🇪",
  "Netherlands": "🇳🇱",
  "Hungary": "🇭🇺",
  "Azerbaijan": "🇦🇿",
  "Canada": "🇨🇦",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Japan": "🇯🇵",
  "Mexico": "🇲🇽",
  "Brazil": "🇧🇷",
  "Australia": "🇦🇺",
  "Bahrain": "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  "China": "🇨🇳",
  "Singapore": "🇸🇬",
  "Qatar": "🇶🇦",
  "UAE": "🇦🇪",
  "United Arab Emirates": "🇦🇪",
};

function getCountryNameInCzech(englishCountryName: string): string {
  return countryTranslations[englishCountryName] || englishCountryName;
}

function getCountryFlagEmoji(englishCountryName: string): string {
  return countryFlags[englishCountryName] || "🏁"; // Default flag if not found
}

export function RaceCard({ race, onClick, isPast }: RaceCardProps) {
  // Format date for display, handling potential invalid dates
  let formattedDate = "Bude oznámeno";
  let formattedTime = "Bude oznámeno";

  try {
    if (race.date) {
      // Parse and validate the date
      const dateStr = `${race.date}T${race.time || '00:00:00Z'}`;
      const raceDate = parseISO(dateStr);

      if (isValid(raceDate)) {
        formattedDate = format(raceDate, "d. MMMM yyyy", { locale: cs });
        formattedTime = race.time ? format(raceDate, "HH:mm", { locale: cs }) : 'Bude oznámeno';
      }
    }
  } catch (error) {
    console.error("Error formatting race date:", error);
    // Keep default values if parsing fails
  }

  const localizedCountryName = getCountryNameInCzech(race.Circuit.Location.country);
  const flagEmoji = getCountryFlagEmoji(race.Circuit.Location.country);

  return (
    <Card
      className="race-card cursor-pointer relative overflow-hidden bg-black/40 backdrop-blur-sm border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-f1-red/5"
      onClick={onClick}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${isPast ? 'bg-gray-600' : 'bg-f1-red'}`}></div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <span className="text-lg mr-1">{flagEmoji}</span>
              <span>{localizedCountryName}</span>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{race.raceName}</h3>
            <div className="flex items-center gap-1.5 text-gray-300 text-sm">
              <MapPinIcon className="h-3.5 w-3.5" />
              <span>{race.Circuit.circuitName}</span>
            </div>
          </div>
          <Badge variant={isPast ? "secondary" : "default"} className={`${isPast ? 'bg-gray-700 hover:bg-gray-600' : 'bg-f1-red hover:bg-f1-red/90'} transition-colors rounded-md px-2.5 py-1 text-xs font-medium`}>
            {isPast ? "Dokončeno" : "Kolo " + race.round}
          </Badge>
        </div>
        <div className="flex items-center mt-4 text-gray-300 bg-black/20 rounded-md p-2">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm">{formattedDate} • {formattedTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}
