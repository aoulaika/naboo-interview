import {
  SetDebugModeMutation,
  SetDebugModeMutationVariables,
} from "@/graphql/generated/types";
import SetDebugMode from "@/graphql/mutations/me/setDebugMode";
import { useAuth } from "@/hooks";
import { useMutation } from "@apollo/client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface DebugContextType {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
}

export const DebugContext = createContext<DebugContextType>({
  isDebugMode: false,
  toggleDebugMode: () => {},
});

interface DebugProviderProps {
  children: React.ReactNode;
}

export const DebugProvider = ({ children }: DebugProviderProps) => {
  const { user } = useAuth();
  const [isDebugMode, setIsDebugMode] = useState(false);

  const [setDebugModeMutation] = useMutation<
    SetDebugModeMutation,
    SetDebugModeMutationVariables
  >(SetDebugMode);

  // Seed local state from the persisted user value when the user loads
  useEffect(() => {
    if (user?.role === "admin") {
      setIsDebugMode(user.debugModeEnabled);
    }
  }, [user?.id]);

  const toggleDebugMode = useCallback(async () => {
    if (user?.role !== "admin") return;
    const next = !isDebugMode;
    setIsDebugMode(next);
    await setDebugModeMutation({ variables: { enabled: next } });
  }, [user, isDebugMode, setDebugModeMutation]);

  return (
    <DebugContext.Provider value={{ isDebugMode, toggleDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
};

export function useDebugMode() {
  return useContext(DebugContext);
}
