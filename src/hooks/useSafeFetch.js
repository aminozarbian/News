import { useState, useEffect, useCallback } from 'react';

export function useSafeFetch(fetcher) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(...args);
      setData(result);
      return { data: result, error: null };
    } catch (err) {
      setError(err.message || 'Error');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  return { data, error, loading, execute, setData };
}

