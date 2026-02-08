// declare module "bcrypt" {
//   export function hash(data: string, salt: number): Promise<string>;
//   export function compare(data: string, hash: string): Promise<boolean>;
// }

// declare module "jose" {
//   export class SignJWT {
//     constructor(payload: Record<string, unknown>);
//     setProtectedHeader(header: { alg: string }): this;
//     setExpirationTime(time: string): this;
//     sign(secret: Uint8Array): Promise<string>;
//   }
//   export function jwtVerify(token: string, secret: Uint8Array): Promise<{ payload: Record<string, unknown> }>;
// }
