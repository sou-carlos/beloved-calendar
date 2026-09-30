import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as auth from "../lib/auth";

interface AuthContextValue {
  account: auth.Account | null;
  loading: boolean;
  connectionError: string;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const ACCOUNT_CACHE = "beloved-last-account";
function cachedAccount(): auth.Account | null {
  try {
    const value = JSON.parse(localStorage.getItem(ACCOUNT_CACHE) || "null");
    return value &&
      typeof value.id === "string" &&
      /^[0-9a-f-]{36}$/i.test(value.id) &&
      typeof value.name === "string" &&
      typeof value.email === "string"
      ? value
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // This cache selects offline data only. The API still authenticates every request using its session.
  const [account, setAccount] = useState<auth.Account | null>(cachedAccount);
  function rememberAccount(value: auth.Account | null) {
    setAccount(value);
    try {
      if (value) localStorage.setItem(ACCOUNT_CACHE, JSON.stringify(value));
      else localStorage.removeItem(ACCOUNT_CACHE);
    } catch {
      /* Local data remains usable if browser storage for preferences is unavailable. */
    }
  }
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState("");
  const generation = useRef(0);
  const changingAccount = useRef(false);
  async function refresh(background = false) {
    if (changingAccount.current) return;
    const current = ++generation.current;
    if (!background) setLoading(true);
    try {
      const result = await auth.currentAccount();
      if (generation.current === current) {
        rememberAccount(result);
        setConnectionError("");
      }
    } catch (error) {
      if (generation.current === current)
        setConnectionError((error as Error).message);
    } finally {
      if (generation.current === current) setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
    const onFocus = () => {
      void refresh(true);
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    const onStorage = (event: StorageEvent) => {
      if (event.key === ACCOUNT_CACHE) {
        generation.current++;
        setAccount(cachedAccount());
        void refresh(true);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      generation.current++;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const value: AuthContextValue = {
    account,
    loading,
    connectionError,
    refresh,
    async signIn(email, password) {
      ++generation.current;
      changingAccount.current = true;
      try {
        const result = await auth.login(email, password);
        rememberAccount(result);
        setConnectionError("");
      } finally {
        changingAccount.current = false;
        setLoading(false);
      }
    },
    async signUp(name, email, password) {
      ++generation.current;
      changingAccount.current = true;
      try {
        const result = await auth.register(name, email, password);
        rememberAccount(result);
        setConnectionError("");
      } finally {
        changingAccount.current = false;
        setLoading(false);
      }
    },
    async signOut() {
      ++generation.current;
      changingAccount.current = true;
      try {
        await auth.logout();
        rememberAccount(null);
        setConnectionError("");
      } finally {
        changingAccount.current = false;
        setLoading(false);
      }
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider não encontrado.");
  return context;
}
