import { BASE_URL } from './config';

export const API_URL = BASE_URL;

// Endpoints
export const ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  USER_PROFILE: `${API_URL}/users/profile`,
  UPDATE_PROFILE: `${API_URL}/users/profile`,
  TICKETS: `${API_URL}/tickets`,
  SEATS: `${API_URL}/seats`,
  EVENTS: `${API_URL}/events`,
  EVENT_DETAIL: `${API_URL}/events-detail`,
  SEAT_STATUS: `${API_URL}/seat-status`,
};

export const API = {
  ORGANIZER: {
    GET_ALL: `${BASE_URL}/organizers`,
    GET_BY_ID: (id: number) => `${BASE_URL}/organizers/${id}`,
  },
}; 