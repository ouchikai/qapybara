import { scrypt as nodeScrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const HASH_PREFIX = "s1";
const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `${HASH_PREFIX}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(args: { password: string; hash: string }): Promise<boolean> {
  const [prefix, salt, hashHex] = args.hash.split("$");

  if (prefix !== HASH_PREFIX || !salt || !hashHex) {
    return false;
  }

  const derived = (await scrypt(args.password, salt, KEY_LENGTH)) as Buffer;
  const expected = Buffer.from(hashHex, "hex");
  const actual = Buffer.from(derived);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
