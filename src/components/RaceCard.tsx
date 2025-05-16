import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid, isSameDay, isWithinInterval } from "date-fns";
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

function getRaceStatus(startDate: Date | null, endDate: Date | null, isPast: boolean): {
  status: "past" | "current" | "upcoming";
  label: string;
  className: string;
} {
  const now = new Date();

  if (!startDate || !endDate) {
    return {
      status: "upcoming",
      label: "Bude oznámeno",
      className: "bg-f1-red hover:bg-f1-red/90",
    };
  }

  if (isPast) {
    return {
      status: "past",
      label: "Dokončeno",
      className: "bg-gray-700 hover:bg-gray-600",
    };
  }

  if (isWithinInterval(now, { start: startDate, end: endDate })) {
    return {
      status: "current",
      label: "Právě probíhá",
      className: "bg-f1-red hover:bg-f1-red/90",
    };
  }

  return {
    status: "upcoming",
    label: "Nadcházející",
    className: "bg-f1-red hover:bg-f1-red/90",
  };
}

export function RaceCard({ race, onClick, isPast }: RaceCardProps) {
  const { startDate, endDate } = getEventDateRange(race);
  const { status, label, className } = getRaceStatus(startDate, endDate, isPast);

  let formattedDateRange = "Bude oznámeno";

  try {
    if (startDate && endDate) {
      if (isSameDay(startDate, endDate)) {
        formattedDateRange = format(startDate, "d. MMMM yyyy", { locale: cs });
      } else {
        const startStr = format(startDate, "d.", { locale: cs });
        const endStr = format(endDate, "d. MMMM yyyy", { locale: cs });
        formattedDateRange = `${startStr} - ${endStr}`;
      }
    }
  } catch (error) {
    console.error("Error formatting race date range:", error);
  }

  const localizedCountryName = getCountryNameInCzech(race.Circuit.Location.country);
  const flagEmoji = getCountryFlagEmoji(race.Circuit.Location.country);

  return (
    <Card
      className={`race-card cursor-pointer relative overflow-hidden backdrop-blur-sm border-0 transition-all duration-300 hover:shadow-xl hover:shadow-f1-red/5 ${status === 'current' ? 'bg-f1-red/20' : 'bg-black/40'}`}
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
          <Badge variant={isPast ? "secondary" : "default"} className={`${className} transition-colors rounded-md px-2.5 py-1 text-xs font-medium`}>
            {label}
          </Badge>
        </div>
        <div className="flex items-center mt-4 text-gray-300 bg-black/20 rounded-md p-2">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm">{formattedDateRange}</span>
        </div>
      </CardContent>
    </Card>
  );
}
