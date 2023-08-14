type ClassValue =
  | string
  | undefined
  | null
  | boolean
  | { [key: string]: boolean };

export function cx(...args: ClassValue[]): string {
  const classes = [];

  for (const arg of args) {
    if (typeof arg === "string") {
      classes.push(arg);
    } else if (typeof arg === "object") {
      for (const key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ");
}
