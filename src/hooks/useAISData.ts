'use client';

import { useEffect, useRef, useState } from 'react';
import type { AISPosition } from '@/types/ais';

const POLL_INTERVAL_MS = 60_000;

interface UseAISDataResult {
  positions: AISPosition[];
  loading: boolean;
  error: boolean;
  lastUpdated: Date | null;
}

export function useAISData(): UseAISDataResult {
  const [positions, setPositions] = useState<AISPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const cachedPositionsRef = useRef<AISPosition[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchPositions = async () => {
      try {
        // global=1 usa bounding box mundial para capturar AIS satelital dos MMSIs cadastrados
        const response = await fetch('/api/ais?global=1', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch AIS positions');
        }

        const payload = (await response.json()) as AISPosition[];
        if (!isMounted) {
          return;
        }

        setError(false);

        if (payload.length > 0) {
          cachedPositionsRef.current = payload;
          setPositions(payload);
          setLastUpdated(new Date());
          return;
        }

        setPositions(cachedPositionsRef.current);
      } catch {
        if (!isMounted) {
          return;
        }

        setError(true);
        setPositions(cachedPositionsRef.current);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPositions();
    const intervalId = window.setInterval(fetchPositions, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return { positions, loading, error, lastUpdated };
}
