declare module "cookie" {
  export interface ParseOptions {
    decode?(value: string): string;
  }

  export function parse(
    cookieHeader: string,
    options?: ParseOptions
  ): Record<string, string | undefined>;
}
