import { useState, useEffect } from 'react';

// Types for F1 data
export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time: string;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
}

export interface RaceSchedule {
  season: string;
  races: Race[];
}

export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface DriverStandingsResponse {
  season: string;
  round: string;
  DriverStandings: DriverStanding[];
}

export interface ConstructorStandingsResponse {
  season: string;
  round: string;
  ConstructorStandings: ConstructorStanding[];
}

// Base URL for Ergast F1 API
const BASE_URL = 'https://ergast.com/api/f1';
const CURRENT_YEAR = '2025';

// Mock data for 2025 season since the real API has no data yet
const MOCK_RACES: Race[] = [
  {
    season: "2025",
    round: "1",
    url: "https://en.wikipedia.org/wiki/2025_Bahrain_Grand_Prix",
    raceName: "Bahrain Grand Prix",
    Circuit: {
      circuitId: "bahrain",
      url: "http://en.wikipedia.org/wiki/Bahrain_International_Circuit",
      circuitName: "Bahrain International Circuit",
      Location: {
        lat: "26.0325",
        long: "50.5106",
        locality: "Sakhir",
        country: "Bahrain"
      }
    },
    date: "2025-03-08",
    time: "15:00:00Z",
    FirstPractice: { date: "2025-03-06", time: "11:30:00Z" },
    SecondPractice: { date: "2025-03-06", time: "15:00:00Z" },
    ThirdPractice: { date: "2025-03-07", time: "12:30:00Z" },
    Qualifying: { date: "2025-03-07", time: "16:00:00Z" }
  },
  {
    season: "2025",
    round: "2",
    url: "https://en.wikipedia.org/wiki/2025_Saudi_Arabian_Grand_Prix",
    raceName: "Saudi Arabian Grand Prix",
    Circuit: {
      circuitId: "jeddah",
      url: "http://en.wikipedia.org/wiki/Jeddah_Street_Circuit",
      circuitName: "Jeddah Corniche Circuit",
      Location: {
        lat: "21.6319",
        long: "39.1044",
        locality: "Jeddah",
        country: "Saudi Arabia"
      }
    },
    date: "2025-03-15",
    time: "18:00:00Z",
    FirstPractice: { date: "2025-03-13", time: "14:30:00Z" },
    SecondPractice: { date: "2025-03-13", time: "18:00:00Z" },
    ThirdPractice: { date: "2025-03-14", time: "14:30:00Z" },
    Qualifying: { date: "2025-03-14", time: "18:00:00Z" }
  },
  {
    season: "2025",
    round: "3",
    url: "https://en.wikipedia.org/wiki/2025_Australian_Grand_Prix",
    raceName: "Australian Grand Prix",
    Circuit: {
      circuitId: "albert_park",
      url: "http://en.wikipedia.org/wiki/Melbourne_Grand_Prix_Circuit",
      circuitName: "Albert Park Circuit",
      Location: {
        lat: "-37.8497",
        long: "144.968",
        locality: "Melbourne",
        country: "Australia"
      }
    },
    date: "2025-03-29",
    time: "06:00:00Z",
    FirstPractice: { date: "2025-03-27", time: "02:30:00Z" },
    SecondPractice: { date: "2025-03-27", time: "06:00:00Z" },
    ThirdPractice: { date: "2025-03-28", time: "03:00:00Z" },
    Qualifying: { date: "2025-03-28", time: "06:00:00Z" }
  },
  {
    season: "2025",
    round: "4",
    url: "https://en.wikipedia.org/wiki/2025_Japanese_Grand_Prix",
    raceName: "Japanese Grand Prix",
    Circuit: {
      circuitId: "suzuka",
      url: "http://en.wikipedia.org/wiki/Suzuka_Circuit",
      circuitName: "Suzuka Circuit",
      Location: {
        lat: "34.8431",
        long: "136.541",
        locality: "Suzuka",
        country: "Japan"
      }
    },
    date: "2025-04-12",
    time: "06:00:00Z",
    FirstPractice: { date: "2025-04-10", time: "03:30:00Z" },
    SecondPractice: { date: "2025-04-10", time: "07:00:00Z" },
    ThirdPractice: { date: "2025-04-11", time: "03:30:00Z" },
    Qualifying: { date: "2025-04-11", time: "07:00:00Z" }
  },
  {
    season: "2025",
    round: "5",
    url: "https://en.wikipedia.org/wiki/2025_Chinese_Grand_Prix",
    raceName: "Chinese Grand Prix",
    Circuit: {
      circuitId: "shanghai",
      url: "http://en.wikipedia.org/wiki/Shanghai_International_Circuit",
      circuitName: "Shanghai International Circuit",
      Location: {
        lat: "31.3389",
        long: "121.22",
        locality: "Shanghai",
        country: "China"
      }
    },
    date: "2025-04-19",
    time: "08:00:00Z",
    FirstPractice: { date: "2025-04-17", time: "04:30:00Z" },
    SecondPractice: { date: "2025-04-17", time: "08:00:00Z" },
    Sprint: { date: "2025-04-18", time: "05:00:00Z" },
    Qualifying: { date: "2025-04-18", time: "09:00:00Z" }
  },
  {
    season: "2025",
    round: "6",
    url: "https://en.wikipedia.org/wiki/2025_Miami_Grand_Prix",
    raceName: "Miami Grand Prix",
    Circuit: {
      circuitId: "miami",
      url: "http://en.wikipedia.org/wiki/Miami_International_Autodrome",
      circuitName: "Miami International Autodrome",
      Location: {
        lat: "25.9581",
        long: "-80.2389",
        locality: "Miami",
        country: "USA"
      }
    },
    date: "2025-05-03",
    time: "20:00:00Z",
    FirstPractice: { date: "2025-05-01", time: "17:30:00Z" },
    Qualifying: { date: "2025-05-01", time: "21:00:00Z" },
    SecondPractice: { date: "2025-05-02", time: "17:30:00Z" },
    Sprint: { date: "2025-05-02", time: "21:00:00Z" }
  },
  {
    season: "2025",
    round: "7",
    url: "https://en.wikipedia.org/wiki/2025_Emilia_Romagna_Grand_Prix",
    raceName: "Emilia Romagna Grand Prix",
    Circuit: {
      circuitId: "imola",
      url: "http://en.wikipedia.org/wiki/Autodromo_Enzo_e_Dino_Ferrari",
      circuitName: "Autodromo Internazionale Enzo e Dino Ferrari",
      Location: {
        lat: "44.3439",
        long: "11.7167",
        locality: "Imola",
        country: "Italy"
      }
    },
    date: "2025-05-17",
    time: "14:00:00Z",
    FirstPractice: { date: "2025-05-15", time: "12:30:00Z" },
    SecondPractice: { date: "2025-05-15", time: "16:00:00Z" },
    ThirdPractice: { date: "2025-05-16", time: "11:30:00Z" },
    Qualifying: { date: "2025-05-16", time: "15:00:00Z" }
  },
  {
    season: "2025",
    round: "8",
    url: "https://en.wikipedia.org/wiki/2025_Monaco_Grand_Prix",
    raceName: "Monaco Grand Prix",
    Circuit: {
      circuitId: "monaco",
      url: "http://en.wikipedia.org/wiki/Circuit_de_Monaco",
      circuitName: "Circuit de Monaco",
      Location: {
        lat: "43.7347",
        long: "7.42056",
        locality: "Monte-Carlo",
        country: "Monaco"
      }
    },
    date: "2025-05-24",
    time: "14:00:00Z",
    FirstPractice: { date: "2025-05-22", time: "12:30:00Z" },
    SecondPractice: { date: "2025-05-22", time: "16:00:00Z" },
    ThirdPractice: { date: "2025-05-23", time: "11:30:00Z" },
    Qualifying: { date: "2025-05-23", time: "15:00:00Z" }
  },
  {
    season: "2025",
    round: "9",
    url: "https://en.wikipedia.org/wiki/2025_Canadian_Grand_Prix",
    raceName: "Canadian Grand Prix",
    Circuit: {
      circuitId: "villeneuve",
      url: "http://en.wikipedia.org/wiki/Circuit_Gilles_Villeneuve",
      circuitName: "Circuit Gilles Villeneuve",
      Location: {
        lat: "45.5",
        long: "-73.5228",
        locality: "Montreal",
        country: "Canada"
      }
    },
    date: "2025-06-07",
    time: "18:00:00Z",
    FirstPractice: { date: "2025-06-05", time: "17:30:00Z" },
    SecondPractice: { date: "2025-06-05", time: "21:00:00Z" },
    ThirdPractice: { date: "2025-06-06", time: "16:30:00Z" },
    Qualifying: { date: "2025-06-06", time: "20:00:00Z" }
  },
  {
    season: "2025",
    round: "10",
    url: "https://en.wikipedia.org/wiki/2025_Spanish_Grand_Prix",
    raceName: "Spanish Grand Prix",
    Circuit: {
      circuitId: "catalunya",
      url: "http://en.wikipedia.org/wiki/Circuit_de_Barcelona-Catalunya",
      circuitName: "Circuit de Barcelona-Catalunya",
      Location: {
        lat: "41.57",
        long: "2.26111",
        locality: "Montmeló",
        country: "Spain"
      }
    },
    date: "2025-06-21",
    time: "14:00:00Z",
    FirstPractice: { date: "2025-06-19", time: "12:30:00Z" },
    SecondPractice: { date: "2025-06-19", time: "16:00:00Z" },
    ThirdPractice: { date: "2025-06-20", time: "11:30:00Z" },
    Qualifying: { date: "2025-06-20", time: "15:00:00Z" }
  }
];

// Mock driver standings
const MOCK_DRIVER_STANDINGS: DriverStanding[] = [
  {
    position: "1",
    positionText: "1",
    points: "103",
    wins: "3",
    Driver: {
      driverId: "max_verstappen",
      permanentNumber: "1",
      code: "VER",
      url: "http://en.wikipedia.org/wiki/Max_Verstappen",
      givenName: "Max",
      familyName: "Verstappen",
      dateOfBirth: "1997-09-30",
      nationality: "Dutch"
    },
    Constructors: [
      {
        constructorId: "red_bull",
        url: "http://en.wikipedia.org/wiki/Red_Bull_Racing",
        name: "Red Bull",
        nationality: "Austrian"
      }
    ]
  },
  {
    position: "2",
    positionText: "2",
    points: "96",
    wins: "2",
    Driver: {
      driverId: "charles_leclerc",
      permanentNumber: "16",
      code: "LEC",
      url: "http://en.wikipedia.org/wiki/Charles_Leclerc",
      givenName: "Charles",
      familyName: "Leclerc",
      dateOfBirth: "1997-10-16",
      nationality: "Monegasque"
    },
    Constructors: [
      {
        constructorId: "ferrari",
        url: "http://en.wikipedia.org/wiki/Scuderia_Ferrari",
        name: "Ferrari",
        nationality: "Italian"
      }
    ]
  },
  {
    position: "3",
    positionText: "3",
    points: "85",
    wins: "1",
    Driver: {
      driverId: "lando_norris",
      permanentNumber: "4",
      code: "NOR",
      url: "http://en.wikipedia.org/wiki/Lando_Norris",
      givenName: "Lando",
      familyName: "Norris",
      dateOfBirth: "1999-11-13",
      nationality: "British"
    },
    Constructors: [
      {
        constructorId: "mclaren",
        url: "http://en.wikipedia.org/wiki/McLaren",
        name: "McLaren",
        nationality: "British"
      }
    ]
  },
  {
    position: "4",
    positionText: "4",
    points: "76",
    wins: "0",
    Driver: {
      driverId: "george_russell",
      permanentNumber: "63",
      code: "RUS",
      url: "http://en.wikipedia.org/wiki/George_Russell_(racing_driver)",
      givenName: "George",
      familyName: "Russell",
      dateOfBirth: "1998-02-15",
      nationality: "British"
    },
    Constructors: [
      {
        constructorId: "mercedes",
        url: "http://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One",
        name: "Mercedes",
        nationality: "German"
      }
    ]
  },
  {
    position: "5",
    positionText: "5",
    points: "75",
    wins: "0",
    Driver: {
      driverId: "lewis_hamilton",
      permanentNumber: "44",
      code: "HAM",
      url: "http://en.wikipedia.org/wiki/Lewis_Hamilton",
      givenName: "Lewis",
      familyName: "Hamilton",
      dateOfBirth: "1985-01-07",
      nationality: "British"
    },
    Constructors: [
      {
        constructorId: "mercedes",
        url: "http://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One",
        name: "Mercedes",
        nationality: "German"
      }
    ]
  }
];

// Mock constructor standings
const MOCK_CONSTRUCTOR_STANDINGS: ConstructorStanding[] = [
  {
    position: "1",
    positionText: "1",
    points: "178",
    wins: "3",
    Constructor: {
      constructorId: "red_bull",
      url: "http://en.wikipedia.org/wiki/Red_Bull_Racing",
      name: "Red Bull Racing",
      nationality: "Austrian"
    }
  },
  {
    position: "2",
    positionText: "2",
    points: "156",
    wins: "2",
    Constructor: {
      constructorId: "ferrari",
      url: "http://en.wikipedia.org/wiki/Scuderia_Ferrari",
      name: "Ferrari",
      nationality: "Italian"
    }
  },
  {
    position: "3",
    positionText: "3",
    points: "151",
    wins: "1",
    Constructor: {
      constructorId: "mercedes",
      url: "http://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One",
      name: "Mercedes",
      nationality: "German"
    }
  },
  {
    position: "4",
    positionText: "4",
    points: "121",
    wins: "0",
    Constructor: {
      constructorId: "mclaren",
      url: "http://en.wikipedia.org/wiki/McLaren",
      name: "McLaren",
      nationality: "British"
    }
  },
  {
    position: "5",
    positionText: "5",
    points: "46",
    wins: "0",
    Constructor: {
      constructorId: "aston_martin",
      url: "http://en.wikipedia.org/wiki/Aston_Martin_in_Formula_One",
      name: "Aston Martin",
      nationality: "British"
    }
  }
];

// Fetch the current season's race schedule
export const useRaceSchedule = () => {
  const [schedule, setSchedule] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        const response = await fetch(`${BASE_URL}/${CURRENT_YEAR}.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch race schedule');
        }
        
        const data = await response.json();
        const apiRaces = data.MRData.RaceTable.Races;
        
        // If API returned empty results, use mock data
        if (apiRaces.length === 0) {
          console.log('No race data from API, using mock data');
          setSchedule(MOCK_RACES);
        } else {
          setSchedule(apiRaces);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        // Fallback to mock data on error
        setSchedule(MOCK_RACES);
        setError(null); // We're using mock data, so don't show error
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return { schedule, loading, error };
};

// Fetch driver standings
export const useDriverStandings = () => {
  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriverStandings = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        const response = await fetch(`${BASE_URL}/${CURRENT_YEAR}/driverStandings.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch driver standings');
        }
        
        const data = await response.json();
        
        // Check if standings are available yet from API
        if (data.MRData.StandingsTable.StandingsLists.length === 0) {
          console.log('No driver standings from API, using mock data');
          setStandings(MOCK_DRIVER_STANDINGS);
        } else {
          setStandings(data.MRData.StandingsTable.StandingsLists[0].DriverStandings);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching driver standings:', err);
        // Fallback to mock data on error
        setStandings(MOCK_DRIVER_STANDINGS);
        setError(null); // We're using mock data, so don't show error
        setLoading(false);
      }
    };

    fetchDriverStandings();
  }, []);

  return { standings, loading, error };
};

// Fetch constructor standings
export const useConstructorStandings = () => {
  const [standings, setStandings] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConstructorStandings = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        const response = await fetch(`${BASE_URL}/${CURRENT_YEAR}/constructorStandings.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch constructor standings');
        }
        
        const data = await response.json();
        
        // Check if standings are available yet from API
        if (data.MRData.StandingsTable.StandingsLists.length === 0) {
          console.log('No constructor standings from API, using mock data');
          setStandings(MOCK_CONSTRUCTOR_STANDINGS);
        } else {
          setStandings(data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching constructor standings:', err);
        // Fallback to mock data on error
        setStandings(MOCK_CONSTRUCTOR_STANDINGS);
        setError(null); // We're using mock data, so don't show error
        setLoading(false);
      }
    };

    fetchConstructorStandings();
  }, []);

  return { standings, loading, error };
};

// Helper function to get race results for a specific round
export const fetchRaceResults = async (season: string, round: string) => {
  try {
    const response = await fetch(`${BASE_URL}/${season}/${round}/results.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch race results');
    }
    const data = await response.json();
    
    // If we have results from API, return them
    if (data.MRData.RaceTable.Races.length > 0) {
      return data.MRData.RaceTable.Races[0];
    } 
    
    // Otherwise return mock data
    // For now just return undefined, but in a real app you'd want to create mock results
    return undefined;
  } catch (err) {
    throw err;
  }
};
