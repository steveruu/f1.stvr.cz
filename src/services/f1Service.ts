
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

// Fetch the current season's race schedule
export const useRaceSchedule = () => {
  const [schedule, setSchedule] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/current.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch race schedule');
        }
        const data = await response.json();
        setSchedule(data.MRData.RaceTable.Races);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
        const response = await fetch(`${BASE_URL}/current/driverStandings.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch driver standings');
        }
        const data = await response.json();
        setStandings(data.MRData.StandingsTable.StandingsLists[0].DriverStandings);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
        const response = await fetch(`${BASE_URL}/current/constructorStandings.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch constructor standings');
        }
        const data = await response.json();
        setStandings(data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    return data.MRData.RaceTable.Races[0];
  } catch (err) {
    throw err;
  }
};
