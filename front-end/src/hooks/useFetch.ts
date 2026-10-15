import { useState, useEffect } from "react";

// Reusable hook to fetch data and manage loading, error, and cleanup states
// TRaw: format coming from JSON/server
// TData: format ready for our components
export function useFetch<TRaw, TData>(
  url: string,
  transform: (raw: TRaw) => TData,
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Flag to ignore stale responses if the URL changes before fetch finishes
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const raw: TRaw = await response.json();
        // Only update state if this request is still the most recent one
        if (!ignore) {
          setData(transform(raw));
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError("Could not load data. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    // Mark current run as outdated when URL changes or component unmounts
    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, loading, error, setData };
}