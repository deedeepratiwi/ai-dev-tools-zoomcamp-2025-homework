import { useState, useCallback, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  email: string;
  total_executions: number;
  successful_executions: number;
  success_rate: number;
  avg_execution_time: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (language?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = language 
        ? `${API_BASE_URL}/leaderboard?language=${language}`
        : `${API_BASE_URL}/leaderboard`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create or get user
  const getOrCreateUser = useCallback(async (username: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use login endpoint that handles both existing and new users
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login/create user');
      }
      
      const user = await response.json();
      setCurrentUser(user);
      return user;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit score
  const submitScore = useCallback(async (
    userId: number,
    language: string,
    codeLength: number,
    executionTime: number,
    successful: boolean
  ) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          language,
          code_length: codeLength,
          execution_time: executionTime,
          successful,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit score');
      
      const score = await response.json();
      
      // Refresh leaderboard after submitting
      await fetchLeaderboard(language);
      
      return score;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    }
  }, [fetchLeaderboard]);

  // Load leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    currentUser,
    loading,
    error,
    fetchLeaderboard,
    getOrCreateUser,
    submitScore,
  };
};
