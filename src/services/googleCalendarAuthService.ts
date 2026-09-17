import { app, auth } from "./firebaseConfig";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from "firebase/auth";

// Provider with Google Calendar scopes
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/calendar.events");
provider.addScope("https://www.googleapis.com/auth/calendar");

// In-memory cache for access token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  status?: string;
  attendees?: { email: string; responseStatus?: string }[];
  colorId?: string;
}

// Initialize Auth State Listener
export const initCalendarAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const signInWithGoogleCalendar = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to extract OAuth access token from Google Sign-In credential.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Calendar Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCalendarAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogleCalendar = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// REAL GOOGLE CALENDAR API INTEGRATION METHODS

/**
 * Fetch real events from Google Calendar (Primary Calendar)
 */
export const fetchRealGoogleCalendarEvents = async (
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEventItem[]> => {
  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250"
  });

  if (timeMin) params.append("timeMin", timeMin);
  if (timeMax) params.append("timeMax", timeMax);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.items || [];
};

/**
 * Create a real event in Google Calendar (Primary Calendar)
 */
export const createRealGoogleCalendarEvent = async (
  accessToken: string,
  eventData: {
    summary: string;
    description?: string;
    location?: string;
    startISO: string;
    endISO: string;
    attendees?: string[];
  }
): Promise<GoogleCalendarEventItem> => {
  const bodyPayload: any = {
    summary: eventData.summary,
    description: eventData.description,
    location: eventData.location,
    start: {
      dateTime: eventData.startISO,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: eventData.endISO,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };

  if (eventData.attendees && eventData.attendees.length > 0) {
    bodyPayload.attendees = eventData.attendees.map((email) => ({ email }));
  }

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPayload)
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google Calendar event (${res.status}): ${errText}`);
  }

  return await res.json();
};

/**
 * Delete a real event from Google Calendar (Primary Calendar)
 */
export const deleteRealGoogleCalendarEvent = async (
  accessToken: string,
  eventId: string
): Promise<boolean> => {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!res.ok && res.status !== 404) {
    const errText = await res.text();
    throw new Error(`Failed to delete Google Calendar event (${res.status}): ${errText}`);
  }

  return true;
};
