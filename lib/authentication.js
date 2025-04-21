import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import db from "@/lib/db";
import { cookies } from "next/headers";

// Defensive check: validate db connection
if (!db || typeof db.prepare !== "function") {
  throw new Error("Database connection is not open or improperly initialized.");
}

// Initialize the adapter
const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
  session: "sessions", // Ensure table names match schema
});

// Initialize Lucia
const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});
// Create auth session
export async function createAuthSession(userId) {
  // Create session
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export async function verifyAuth() {
  // Get the cookie store
  const cookieStore = await cookies();

  // Check if the session cookie exists
  const sessionCookie = cookieStore.get(lucia.sessionCookieName);
  // If the session cookie doesn't exist, return null or handle accordingly
  if (!sessionCookie) {
    return { user: null, session: null };
  }
  // Extract session ID from the cookie
  const sessionId = sessionCookie.value;
  if (!sessionId) {
    return { user: null, session: null };
  }
  // Verify session
  const result = await lucia.validateSession(sessionId);
  // Check if the session is valid and not expired
  try {
    if (result.session && result.session.fresh) {
      // Session is valid and not expired
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      // Set the session cookie again to refresh it
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }

    if (!result.session) {
      const sessionCookie = lucia.createSessionCookie();

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}

  return result;
}



export async function destroySession(){

  const { session } = await verifyAuth(); // destructure the session object

  if (!session || !session.id) {
    return { error: "No active session found" };
  }

  // Invalidate session in DB
  await lucia.invalidateSession(session.id);

  // Clear the session cookie
  const cookieStore = await cookies();
  const blankSessionCookie = lucia.createBlankSessionCookie();
  
  cookieStore.set(
    blankSessionCookie.name,
    blankSessionCookie.value,
    blankSessionCookie.attributes
  );
  console.log("Session destroyed and cookie cleared.");

//  const sessionCookie = lucia.createBlankSessionCookie();
//   (await cookies()).set(
//     sessionCookie.name,
//     sessionCookie.value,
//     sessionCookie.attributes
//   );
}