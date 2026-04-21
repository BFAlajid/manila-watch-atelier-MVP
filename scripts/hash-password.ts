// scripts/hash-password.ts — Generate a scrypt password hash for ADMIN_PASSWORD_HASH.
//
// Usage:
//   echo -n 'your-password' | npm run hash:password
//   or
//   npm run hash:password -- 'your-password'   (less safe: leaves password in shell history)
//
// Copy the output into ADMIN_PASSWORD_HASH (Vercel env + .env locally).
// Tokens signed under the old SHA-256 hash remain valid until their TTL elapses
// (4 hours) because verifyPassword supports both formats during transition.

import { hashPasswordScrypt } from '../api/_lib/auth.js';

async function main() {
  let password = process.argv[2];
  if (!password) {
    // Read from stdin so it doesn't land in shell history
    password = await new Promise<string>((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf-8');
      process.stdin.on('data', (chunk) => (data += chunk));
      process.stdin.on('end', () => resolve(data.replace(/\r?\n$/, '')));
    });
  }
  if (!password) {
    console.error('No password provided. Pipe one via stdin or pass as arg.');
    process.exit(1);
  }
  const hash = hashPasswordScrypt(password);
  console.log(hash);
}

main().catch((err) => {
  console.error('[hash:password] Failed:', err?.message || err);
  process.exit(1);
});
