type JsonSerializable =
  | null
  | boolean
  | number
  | string
  | JsonSerializable[]
  | { [key: string]: JsonSerializable };

export const deepEqual = <T extends JsonSerializable>(
  obj1: T,
  obj2: T,
): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};
