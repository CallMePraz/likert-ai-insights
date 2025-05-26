import axios from 'axios';

// Use environment variable with fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export interface SurveyResponse {
  id: number;
  date: string;
  rating: number;
  comment: string;
  branch: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  teller_id: string;  // Add teller_id field
}

export interface SurveyDataResponse {
  data: SurveyResponse[];
  totalCount: number;
  serverDate?: string;
}

export const getSurveyData = async (
  limit: number,
  offset: number,
  sortKey?: keyof SurveyResponse,
  sortOrder?: 'asc' | 'desc',
  startDate?: string,
  endDate?: string,
  search?: string
): Promise<SurveyDataResponse> => {
  try {
    const response = await api.get('/survey-data', {
      params: {
        limit,
        offset,
        sort: sortKey,
        order: sortOrder,
        startDate,
        endDate,
        search
      }
    });

    // Convert totalCount to number if it's a string
    const totalCount = typeof response.data.totalCount === 'string' 
      ? parseInt(response.data.totalCount, 10)
      : response.data.totalCount;

    if (!response.data || !Array.isArray(response.data.data) || typeof totalCount !== 'number') {
      console.error('Invalid response data:', response.data);
      throw new Error('Invalid response format from server');
    }

    return {
      data: response.data.data,
      totalCount: totalCount,
      serverDate: response.data.serverDate // Pass through the server date
    };
  } catch (error) {
    console.error('Error in getSurveyData:', error);
    throw error;
  }
};

export const getTopPerformance = async (
  limit: number,
  offset: number,
  sortKey?: keyof SurveyResponse,
  sortOrder?: 'asc' | 'desc',
  startDate?: string,
  endDate?: string,
  search?: string
): Promise<SurveyDataResponse> => {
  try {
    const response = await api.get('/top-performance', {
      params: {
        limit,
        offset,
        sort: sortKey,
        order: sortOrder,
        startDate,
        endDate,
        search
      }
    });
    const totalCount = typeof response.data.totalCount === 'string' 
      ? parseInt(response.data.totalCount, 10)
      : response.data.totalCount;
    if (!response.data || !Array.isArray(response.data.data) || typeof totalCount !== 'number') {
      console.error('Invalid response data:', response.data);
      throw new Error('Invalid response format from server');
    }
    return {
      data: response.data.data,
      totalCount: totalCount,
      serverDate: response.data.serverDate
    };
  } catch (error) {
    console.error('Error in getTopPerformance:', error);
    throw error;
  }
};

export const getBadPerformance = async (
  limit: number,
  offset: number,
  sortKey?: keyof SurveyResponse,
  sortOrder?: 'asc' | 'desc',
  startDate?: string,
  endDate?: string,
  search?: string
): Promise<SurveyDataResponse> => {
  try {
    const response = await api.get('/bad-performance', {
      params: {
        limit,
        offset,
        sort: sortKey,
        order: sortOrder,
        startDate,
        endDate,
        search
      }
    });
    const totalCount = typeof response.data.totalCount === 'string' 
      ? parseInt(response.data.totalCount, 10)
      : response.data.totalCount;
    if (!response.data || !Array.isArray(response.data.data) || typeof totalCount !== 'number') {
      console.error('Invalid response data:', response.data);
      throw new Error('Invalid response format from server');
    }
    return {
      data: response.data.data,
      totalCount: totalCount,
      serverDate: response.data.serverDate
    };
  } catch (error) {
    console.error('Error in getBadPerformance:', error);
    throw error;
  }
};
