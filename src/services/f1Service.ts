
import { useState, useEffect } from 'react';

// Types for F1 data
export interface Race {
  meeting_key?: number;
  meeting_name?: string;
  meeting_official_name?: string;
  country_code?: string;
  country_name?: string;
  circuit_key?: number;
  circuit_short_name?: string;
  date_start?: string;
  date?: string;
  time?: string;
  season?: string;
  round?: string;
  url?: string;
  raceName?: string;
  Circuit?: {
    circuitId?: string;
    url?: string;
    circuitName?: string;
    Location?: {
      lat?: string;
      long?: string;
      locality?: string;
      country?: string;
    };
  };
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
  driver_number?: string;
  broadcast_name?: string;
  full_name?: string;
  name_acronym?: string;
  team_name?: string;
  team_color?: string;
  first_name?: string;
  last_name?: string;
  country_code?: string;
  
  // Compatibility with previous interface
  driverId?: string;
  permanentNumber?: string;
  code?: string;
  url?: string;
  givenName?: string;
  familyName?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface Constructor {
  team_name?: string;
  team_color?: string;
  country_code?: string;
  
  // Compatibility with previous interface
  constructorId?: string;
  url?: string;
  name?: string;
  nationality?: string;
}

export interface DriverStanding {
  position?: string;
  positionText?: string;
  points?: string;
  wins?: string;
  Driver: Driver;
  Constructors?: Constructor[];
}

export interface ConstructorStanding {
  position?: string;
  positionText?: string;
  points?: string;
  wins?: string;
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

export interface SessionResult {
  position?: number;
  driver_number?: string;
  broadcast_name?: string;
  name_acronym?: string;
  team_name?: string;
  team_color?: string;
  lap_time?: string;
  gap_to_leader?: string;
  interval_to_position_ahead?: string;
  laps?: number;
}

// Base URLs for F1 APIs
const OPENF1_BASE_URL = 'https://api.openf1.org/v1';
const CURRENT_YEAR = '2025';

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Helper function to format time
const formatTime = (dateTime: string) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toTimeString().slice(0, 5) + ':00Z'; // Format like HH:MM:00Z
};

// Fetch the current season's race schedule
export const useRaceSchedule = () => {
  const [schedule, setSchedule] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        
        // Fetch race schedule from OpenF1 API
        const response = await fetch(`${OPENF1_BASE_URL}/meetings?year=${CURRENT_YEAR}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch race schedule: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
          throw new Error('No race data available for the selected season');
        }
        
        // Transform the data to match our Race interface
        const races = data.map((meeting: any) => ({
          meeting_key: meeting.meeting_key,
          meeting_name: meeting.meeting_name,
          meeting_official_name: meeting.meeting_official_name,
          country_code: meeting.country_code,
          country_name: meeting.country_name,
          circuit_key: meeting.circuit_key,
          circuit_short_name: meeting.circuit_short_name,
          date_start: meeting.date_start,
          // Transform to compatible format with previous interface
          date: formatDate(meeting.date_start),
          time: formatTime(meeting.date_start),
          season: CURRENT_YEAR,
          round: `${meeting.meeting_key}`,
          url: `https://en.wikipedia.org/wiki/${CURRENT_YEAR}_${meeting.meeting_name.replace(/\s+/g, '_')}_Grand_Prix`,
          raceName: `${meeting.meeting_name} Grand Prix`,
          Circuit: {
            circuitId: meeting.circuit_key.toString(),
            url: `https://en.wikipedia.org/wiki/${meeting.circuit_short_name.replace(/\s+/g, '_')}`,
            circuitName: meeting.circuit_short_name,
            Location: {
              lat: "0", // OpenF1 doesn't provide lat/long
              long: "0",
              locality: meeting.meeting_name,
              country: meeting.country_name
            }
          }
        }));
        
        console.log('Fetched races from OpenF1:', races);
        setSchedule(races);
        setLoading(false);
        setError(null);
        
      } catch (err: any) {
        console.error('Error fetching schedule:', err);
        setError(err.message || 'Failed to fetch race schedule');
        setSchedule([]);
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
        
        // In OpenF1, we need to find the latest session to get driver info
        const sessionsResponse = await fetch(`${OPENF1_BASE_URL}/sessions?year=${CURRENT_YEAR}`);
        
        if (!sessionsResponse.ok) {
          throw new Error(`Failed to fetch sessions: ${sessionsResponse.status}`);
        }
        
        const sessions = await sessionsResponse.json();
        
        if (!sessions || sessions.length === 0) {
          throw new Error('No session data available');
        }
        
        // Sort sessions by date (newest first)
        sessions.sort((a: any, b: any) => 
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
        );
        
        // Get latest session key
        const latestSessionKey = sessions[0].session_key;
        
        // Fetch driver data from the latest session
        const driversResponse = await fetch(`${OPENF1_BASE_URL}/drivers?session_key=${latestSessionKey}`);
        
        if (!driversResponse.ok) {
          throw new Error(`Failed to fetch drivers: ${driversResponse.status}`);
        }
        
        const drivers = await driversResponse.json();
        
        if (!drivers || drivers.length === 0) {
          throw new Error('No driver data available');
        }
        
        console.log('Fetched drivers from OpenF1:', drivers);
        
        // Get driver results to calculate points (if available)
        const resultsResponse = await fetch(`${OPENF1_BASE_URL}/results?session_key=${latestSessionKey}`);
        let results: any[] = [];
        
        if (resultsResponse.ok) {
          results = await resultsResponse.json();
        }
        
        // Calculate points based on position (simplified F1 points system)
        const pointsDistribution: {[key: number]: string} = {
          1: "25", 2: "18", 3: "15", 4: "12", 5: "10", 
          6: "8", 7: "6", 8: "4", 9: "2", 10: "1"
        };
        
        // Transform the data to match our DriverStanding interface
        const driverStandings = drivers.map((driver: any, index: number) => {
          // Find this driver in results if available
          const driverResult = results.find(r => r.driver_number === driver.driver_number);
          const position = driverResult?.position || (index + 1).toString();
          
          return {
            position: position.toString(),
            positionText: position.toString(),
            points: pointsDistribution[parseInt(position)] || "0",
            wins: "0", // OpenF1 doesn't provide this directly
            Driver: {
              driver_number: driver.driver_number,
              broadcast_name: driver.broadcast_name,
              full_name: driver.full_name,
              name_acronym: driver.name_acronym,
              team_name: driver.team_name,
              team_color: driver.team_color,
              country_code: driver.country_code,
              
              // Compatibility with previous interface
              driverId: driver.name_acronym?.toLowerCase(),
              permanentNumber: driver.driver_number,
              code: driver.name_acronym,
              givenName: driver.full_name?.split(' ')[0],
              familyName: driver.full_name?.split(' ').slice(1).join(' '),
              nationality: driver.country_code
            },
            Constructors: [
              {
                team_name: driver.team_name,
                team_color: driver.team_color,
                
                // Compatibility with previous interface
                constructorId: driver.team_name?.toLowerCase().replace(/\s+/g, '_'),
                name: driver.team_name,
                nationality: "" // OpenF1 doesn't provide this
              }
            ]
          };
        });
        
        // Sort by position
        driverStandings.sort((a, b) => 
          parseInt(a.position || "0") - parseInt(b.position || "0")
        );
        
        setStandings(driverStandings);
        setLoading(false);
        setError(null);
        
      } catch (err: any) {
        console.error('Error fetching driver standings:', err);
        setError(err.message || 'Failed to fetch driver standings');
        setStandings([]);
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
        
        // In OpenF1, we need to find the latest session to get team info
        const sessionsResponse = await fetch(`${OPENF1_BASE_URL}/sessions?year=${CURRENT_YEAR}`);
        
        if (!sessionsResponse.ok) {
          throw new Error(`Failed to fetch sessions: ${sessionsResponse.status}`);
        }
        
        const sessions = await sessionsResponse.json();
        
        if (!sessions || sessions.length === 0) {
          throw new Error('No session data available');
        }
        
        // Sort sessions by date (newest first)
        sessions.sort((a: any, b: any) => 
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
        );
        
        // Get latest session key
        const latestSessionKey = sessions[0].session_key;
        
        // Fetch driver data to extract team info
        const driversResponse = await fetch(`${OPENF1_BASE_URL}/drivers?session_key=${latestSessionKey}`);
        
        if (!driversResponse.ok) {
          throw new Error(`Failed to fetch drivers: ${driversResponse.status}`);
        }
        
        const drivers = await driversResponse.json();
        
        if (!drivers || drivers.length === 0) {
          throw new Error('No driver data available');
        }
        
        // Extract unique teams and aggregate points
        const teamsMap = new Map<string, any>();
        
        drivers.forEach((driver: any) => {
          const teamName = driver.team_name;
          
          if (!teamName) return;
          
          if (!teamsMap.has(teamName)) {
            teamsMap.set(teamName, {
              team_name: teamName,
              team_color: driver.team_color,
              points: 0,
              wins: 0
            });
          }
        });
        
        // Get results to calculate team points (if available)
        const resultsResponse = await fetch(`${OPENF1_BASE_URL}/results?session_key=${latestSessionKey}`);
        
        if (resultsResponse.ok) {
          const results = await resultsResponse.json();
          
          // Calculate points based on position (simplified F1 points system)
          const pointsDistribution: {[key: number]: number} = {
            1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 
            6: 8, 7: 6, 8: 4, 9: 2, 10: 1
          };
          
          // Add points to teams
          results.forEach((result: any) => {
            const team = teamsMap.get(result.team_name);
            if (team && result.position && result.position <= 10) {
              team.points += pointsDistribution[result.position] || 0;
              
              // Count wins
              if (result.position === 1) {
                team.wins += 1;
              }
            }
          });
        }
        
        // Convert map to array and sort by points
        const constructorStandings = Array.from(teamsMap.values())
          .map((team, index) => ({
            position: (index + 1).toString(),
            positionText: (index + 1).toString(),
            points: team.points.toString(),
            wins: team.wins.toString(),
            Constructor: {
              team_name: team.team_name,
              team_color: team.team_color,
              
              // Compatibility with previous interface
              constructorId: team.team_name?.toLowerCase().replace(/\s+/g, '_'),
              name: team.team_name,
              nationality: "" // OpenF1 doesn't provide this
            }
          })) as ConstructorStanding[];
        
        // Sort by points (descending)
        constructorStandings.sort((a, b) => 
          parseInt(b.points || "0") - parseInt(a.points || "0")
        );
        
        // Update positions after sorting
        constructorStandings.forEach((standing, index) => {
          standing.position = (index + 1).toString();
          standing.positionText = (index + 1).toString();
        });
        
        console.log('Generated constructor standings from OpenF1:', constructorStandings);
        setStandings(constructorStandings);
        setLoading(false);
        setError(null);
        
      } catch (err: any) {
        console.error('Error fetching constructor standings:', err);
        setError(err.message || 'Failed to fetch constructor standings');
        setStandings([]);
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
    // Find the session key for the race
    const sessionsResponse = await fetch(`${OPENF1_BASE_URL}/sessions?year=${season}&meeting_key=${round}`);
    
    if (!sessionsResponse.ok) {
      throw new Error(`Failed to fetch sessions: ${sessionsResponse.status}`);
    }
    
    const sessions = await sessionsResponse.json();
    
    // Find race session (type_key 3 is race)
    const raceSession = sessions.find((s: any) => s.type_key === 3);
    
    if (!raceSession) {
      throw new Error('Race session not found');
    }
    
    const sessionKey = raceSession.session_key;
    
    // Fetch results for this session
    const resultsResponse = await fetch(`${OPENF1_BASE_URL}/results?session_key=${sessionKey}`);
    
    if (!resultsResponse.ok) {
      throw new Error(`Failed to fetch results: ${resultsResponse.status}`);
    }
    
    const results = await resultsResponse.json();
    
    // Add additional race details
    const raceDetails = {
      season,
      round,
      raceName: raceSession.meeting_name + ' Grand Prix',
      date: formatDate(raceSession.date_start),
      Circuit: {
        circuitName: raceSession.circuit_short_name
      },
      Results: results.map((r: SessionResult) => ({
        position: r.position,
        Driver: {
          code: r.name_acronym,
          givenName: r.broadcast_name?.split(' ')[0],
          familyName: r.broadcast_name?.split(' ').slice(1).join(' '),
        },
        Constructor: {
          name: r.team_name
        },
        Time: {
          time: r.lap_time
        },
        laps: r.laps,
        gap: r.gap_to_leader,
        interval: r.interval_to_position_ahead
      }))
    };
    
    return raceDetails;
    
  } catch (err) {
    console.error('Error fetching race results:', err);
    throw err;
  }
};
