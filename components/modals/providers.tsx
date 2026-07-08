"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

// The sign-in modal was tied to NextAuth and has been removed along with the
// rest of the dead auth scaffold. This context is kept as a no-op so
// existing callers (navbar, mobile nav) keep compiling; wire up a real modal
// once Clerk is in place.
export const ModalContext = createContext<{
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}>({
  setShowSignInModal: () => {},
});

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [, setShowSignInModal] = useState(false);

  return (
    <ModalContext.Provider value={{ setShowSignInModal }}>
      {children}
    </ModalContext.Provider>
  );
}
