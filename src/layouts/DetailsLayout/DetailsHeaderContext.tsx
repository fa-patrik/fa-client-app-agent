import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Context structure for details header management.
 */
interface DetailsHeaderContextValue {
  /** Current resolved header text (null if not set yet) */
  header: string | null;
  /** Set (or clear) the header */
  setHeader: (value: string | null) => void;
  /** Whether current page declared it is still resolving its header */
  pending: boolean;
  /** Set pending state (internal: use details hook) */
  setPending: (value: boolean) => void;
}

const DetailsHeaderContext = createContext<
  DetailsHeaderContextValue | undefined
>(undefined);

export const DetailsHeaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [header, setHeaderState] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Track last non-null header to optionally keep displaying while new one loads (can be enabled later)
  const lastHeaderRef = useRef<string | null>(null);

  const setHeader = useCallback((value: string | null) => {
    setHeaderState(value);
    if (value) lastHeaderRef.current = value;
  }, []);

  const value: DetailsHeaderContextValue = useMemo(
    () => ({
      header,
      setHeader,
      pending,
      setPending,
    }),
    [header, setHeader, pending, setPending]
  );

  return (
    <DetailsHeaderContext.Provider value={value}>
      {children}
    </DetailsHeaderContext.Provider>
  );
};

export const useDetailsHeaderContext = () => {
  const ctx = useContext(DetailsHeaderContext);
  if (!ctx)
    throw new Error(
      "useDetailsHeaderContext must be used within DetailsHeaderProvider"
    );
  return ctx;
};

/**
 * Page-level hook: call inside detail pages to set the header.
 * Automatically cleans up on unmount.
 * @param header The resolved header (or null/undefined while loading)
 * @param options.loading Pass the loading boolean of the data fetch; used to show spinner
 */
export const useDetailsHeader = (
  header: string | null | undefined,
  options?: { loading?: boolean }
) => {
  const { setHeader, setPending } = useDetailsHeaderContext();
  React.useEffect(() => {
    const isLoading = !!options?.loading && !header;
    setPending(isLoading);
    if (header) setHeader(header);
    return () => {
      setHeader(null);
      setPending(false);
    };
    // We intentionally ignore setHeader/setPending in deps (stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header, options?.loading]);
};
