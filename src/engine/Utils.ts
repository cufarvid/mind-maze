export default class Utils {
  static init(
    object: any,
    defaults: Record<string, any>,
    options: Record<string, any>,
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const filtered = Utils.clone(options || {});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const defaulted = Utils.clone(defaults || {});
    for (const key in filtered) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,no-prototype-builtins
      if (!defaulted.hasOwnProperty(key)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete filtered[key];
      }
    }
    Object.assign(object, defaulted, filtered);
  }

  static clone(object: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(JSON.stringify(object));
  }
}
