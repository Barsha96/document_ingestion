/**
 * Serializes objects containing BigInt values to JSON-safe format
 * Converts BigInt to string representation
 */
export function serializeBigInt<T>(obj: T): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

/**
 * Custom replacer function for JSON.stringify to handle BigInt
 */
export function bigIntReplacer(_key: string, value: any): any {
  return typeof value === 'bigint' ? value.toString() : value;
}
