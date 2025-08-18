export const sanitizeInput = <T extends object | null | undefined>(
  input: T,
): Partial<T> => {
  if (!input || typeof input !== 'object') {
    return {} as Partial<T>
  }

  return Object.fromEntries(
    Object.entries(input).filter(([_, v]) => v != null),
  ) as Partial<T>
}
