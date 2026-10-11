// One-time setup: creates the single admin account.
// Run with:  npm run create-admin
// The password is typed at a hidden prompt and never stored in plain text.
import readline from 'node:readline/promises';
import { z } from 'zod';
import { pool } from '../src/config/database.js';
import { countAdmins, createAdmin } from '../src/models/adminModel.js';
import { hashPassword } from '../src/services/authService.js';

function askHidden(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';

    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(value);
          return;
        }
        if (ch === '\u0003') {
          process.stdout.write('\n');
          process.exit(1);
        }
        if (ch === '\u007f' || ch === '\b') {
          value = value.slice(0, -1);
        } else {
          value += ch;
        }
      }
    };
    stdin.on('data', onData);
  });
}

const inputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(12, 'Password must be at least 12 characters').max(72),
});

async function main() {
  if ((await countAdmins()) > 0) {
    console.error('An admin account already exists. Nothing was changed.');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const name = await rl.question('Admin name: ');
  const email = await rl.question('Admin email: ');
  rl.close();

  const password = await askHidden('Password (min 12 characters): ');
  const confirm = await askHidden('Confirm password: ');

  if (password !== confirm) {
    console.error('Passwords did not match. Nothing was changed.');
    return;
  }

  const parsed = inputSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    console.error('Invalid input:');
    for (const issue of parsed.error.issues) {
      console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    }
    return;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const id = await createAdmin({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
  });
  console.log(`Admin account created (id ${id}) for ${parsed.data.email}`);
}

main()
  .catch((err) => console.error('Failed:', err.code || err.message))
  .finally(() => pool.end());