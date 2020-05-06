export const repeat = <T>(size: number, value: T): T[] => [...Array(size)].map(() => value)
