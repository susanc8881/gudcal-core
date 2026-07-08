// Identity resolution is not wired up yet. Per the Calendar Team deliverable
// sheet, the Security team owns matching the authenticated session to a
// Person via Person.clerk_id once Clerk is integrated (@clerk/nextjs is not
// yet installed in this project). This is the single place that resolution
// should be implemented — everything that needs "who is the current person"
// calls through here instead of re-deriving identity itself.
//
// Returns null until Clerk is wired up, so callers fail closed (redirect to
// login / reject the request) rather than granting access to the wrong
// person or trusting client-supplied identity.
export async function getCurrentPersonId(): Promise<number | null> {
  return null;
}
