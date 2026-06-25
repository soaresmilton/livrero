import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useBookSearch(query: string, delay = 500) {
  const debouncedQuery = useDebounce(query, delay);

  return useQuery({
    queryKey: ['books', 'search', debouncedQuery],
    queryFn: () => bookService.searchBooks(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });
}
