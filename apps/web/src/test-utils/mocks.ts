import type { UseQueryResult } from '@tanstack/react-query';
import { vi } from 'vitest';

export const makeQuery = <T,>(data: T, isLoading = false): UseQueryResult<T, Error> => ({
  data,
  error: null,
  isLoading,
  isError: false,
  isSuccess: !isLoading,
  status: isLoading ? 'pending' : 'success',
  refetch: vi.fn(),
  fetchStatus: 'idle',
  failureCount: 0,
} as unknown as UseQueryResult<T, Error>);
