import { google } from "googleapis";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { prisma } from "@/lib/db";

// Meeting link creation is handled separately via the Google Meet REST API,
// not through Calendar event conferenceData. This module only syncs busy
// times and writes plain calendar events.
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  );
}

// AES-256-GCM encryption
const ALGORITHM = "aes-256-gcm";
const KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  : randomBytes(32);

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function getGoogleAuthUrl(personId: number): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: String(personId),
  });
}

export async function handleGoogleCallback(
  code: string,
  personId: number
): Promise<void> {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error("No access token received");
  }

  // Get the connected account's primary calendar id (their email)
  oauth2Client.setCredentials(tokens);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const calendarList = await calendar.calendarList.list();
  const primaryCalendar = calendarList.data.items?.find((c) => c.primary);
  const calendarId = primaryCalendar?.id ?? undefined;

  await prisma.googleCalendarConnection.upsert({
    where: { person_id: personId },
    update: {
      access_token: encrypt(tokens.access_token),
      refresh_token: tokens.refresh_token
        ? encrypt(tokens.refresh_token)
        : undefined,
      expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : undefined,
      calendar_id: calendarId,
    },
    create: {
      person_id: personId,
      access_token: encrypt(tokens.access_token),
      refresh_token: tokens.refresh_token
        ? encrypt(tokens.refresh_token)
        : null,
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      calendar_id: calendarId,
    },
  });
}

export async function getGoogleCalendarClient(personId: number) {
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { person_id: personId },
  });

  if (!connection) {
    throw new Error("No Google Calendar connection found");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: decrypt(connection.access_token),
    refresh_token: connection.refresh_token
      ? decrypt(connection.refresh_token)
      : undefined,
    expiry_date: connection.expires_at?.getTime(),
  });

  // Handle token refresh
  oauth2Client.on("tokens", async (tokens) => {
    const updateData: {
      access_token?: string;
      refresh_token?: string;
      expires_at?: Date;
    } = {};
    if (tokens.access_token) {
      updateData.access_token = encrypt(tokens.access_token);
    }
    if (tokens.refresh_token) {
      updateData.refresh_token = encrypt(tokens.refresh_token);
    }
    if (tokens.expiry_date) {
      updateData.expires_at = new Date(tokens.expiry_date);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.googleCalendarConnection.update({
        where: { connection_id: connection.connection_id },
        data: updateData,
      });
    }
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function getBusyTimes(
  personId: number,
  startDate: Date,
  endDate: Date
): Promise<{ start: Date; end: Date }[]> {
  try {
    const calendar = await getGoogleCalendarClient(personId);
    const connection = await prisma.googleCalendarConnection.findUnique({
      where: { person_id: personId },
    });

    if (!connection?.calendar_id) return [];

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: connection.calendar_id }],
      },
    });

    const busy = response.data.calendars?.[connection.calendar_id]?.busy ?? [];

    return busy
      .filter((b) => b.start && b.end)
      .map((b) => ({
        start: new Date(b.start!),
        end: new Date(b.end!),
      }));
  } catch (error) {
    console.error("Error fetching busy times:", error);
    return [];
  }
}

interface CalendarEventInput {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail: string;
  additionalAttendees?: { email: string }[];
  // Pre-created Google Meet link from the Meet REST API integration, if any.
  meetingUrl?: string;
}

export interface CalendarEventResult {
  eventId: string;
}

export async function createCalendarEvent(
  personId: number,
  event: CalendarEventInput
): Promise<CalendarEventResult | null> {
  try {
    const calendar = await getGoogleCalendarClient(personId);

    const eventData: {
      summary: string;
      description?: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
      attendees: { email: string }[];
      location?: string;
    } = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: [
        { email: event.attendeeEmail },
        ...(event.additionalAttendees ?? []),
      ],
    };

    if (event.meetingUrl) {
      eventData.location = event.meetingUrl;
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: eventData,
      sendUpdates: "all",
    });

    if (!response.data.id) return null;

    return { eventId: response.data.id };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return null;
  }
}

export async function updateCalendarEvent(
  personId: number,
  eventId: string,
  event: Partial<CalendarEventInput>
): Promise<boolean> {
  try {
    const calendar = await getGoogleCalendarClient(personId);

    const updateData: {
      summary?: string;
      description?: string;
      start?: { dateTime: string; timeZone: string };
      end?: { dateTime: string; timeZone: string };
    } = {};
    if (event.summary) updateData.summary = event.summary;
    if (event.description) updateData.description = event.description;
    if (event.startTime) {
      updateData.start = {
        dateTime: event.startTime.toISOString(),
        timeZone: "UTC",
      };
    }
    if (event.endTime) {
      updateData.end = {
        dateTime: event.endTime.toISOString(),
        timeZone: "UTC",
      };
    }

    await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: updateData,
      sendUpdates: "all",
    });

    return true;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return false;
  }
}

export async function deleteCalendarEvent(
  personId: number,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = await getGoogleCalendarClient(personId);

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all",
    });

    return true;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return false;
  }
}
