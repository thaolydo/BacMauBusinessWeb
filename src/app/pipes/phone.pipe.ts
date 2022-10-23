import { Pipe } from "@angular/core";

/**
 * This pipe is to display phone number in the following format: (xxx) -xxx-xxxx.
 */
@Pipe({
  name: "phone"
})
export class PhonePipe {

  /**
   *
   * @param value Expected format: +1xxxxxxxxx
   * @param args
   * @returns
   */
  transform(value: string, ...args: unknown[]): unknown {
    if (!value) {
      return value;
    }

    // Skip +1
    if (value.startsWith('+1')) {
      value = value.substring(2);
    }

    return `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
  }
}
