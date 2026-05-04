/**
 * Safe fallback utility for missing industrial metrics
 * Uses real value if available, falls back to mock with visual indicator
 */

export const withMockFallback = <T>(realValue: T | null | undefined, mockValue: T, label = 'mock'): { value: T; isMock: boolean } => {
  if (realValue !== null && realValue !== undefined) {
    return { value: realValue, isMock: false };
  }
  return { value: mockValue, isMock: true };
};

export const getMockLabel = (isMock: boolean): string => {
  return isMock ? ' (simulated)' : '';
};
