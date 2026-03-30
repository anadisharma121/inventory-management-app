import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'inventory_session';

export type SessionUser = {
  username: string;
  tableName: string;
};

type EnvUserConfig = {
  username: string;
  password: string;
  tableName: string;
};

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      const trimmed = value.trim();
      const unquoted = trimmed.replace(/^['\"](.*)['\"]$/, '$1');
      return unquoted;
    }
  }
  return '';
}

function getResolvedTables(): { table1: string; table2: string } {
  return {
    table1: readEnv('TABLE1_NAME', 'USER1_TABLE', 'APP_USER1_TABLE') || 'base table',
    table2: readEnv('TABLE2_NAME', 'USER2_TABLE', 'APP_USER2_TABLE') || 'stock_table2',
  };
}

export function normalizeTableName(tableName: string): string {
  const cleanName = tableName.trim().replace(/^['"](.*)['"]$/, '$1');
  if (!cleanName) {
    return cleanName;
  }

  const normalizedName = cleanName.toLowerCase();
  const { table1, table2 } = getResolvedTables();

  const table1Aliases = new Set([
    table1,
    'base table',
    'stock_table1',
    'table1',
    'user1_table',
    'app_user1_table',
  ].map((value) => value.toLowerCase()));

  const table2Aliases = new Set([
    table2,
    'stock_table2',
    'table2',
    'user2_table',
    'app_user2_table',
  ].map((value) => value.toLowerCase()));

  if (table1Aliases.has(normalizedName)) {
    return table1;
  }

  if (table2Aliases.has(normalizedName)) {
    return table2;
  }

  return cleanName;
}

function getEnvUsers(): EnvUserConfig[] {
  const user1: EnvUserConfig = {
    username: readEnv('USER1_USERNAME', 'APP_USER1_USERNAME'),
    password: readEnv('USER1_PASSWORD', 'APP_USER1_PASSWORD'),
    tableName: readEnv('TABLE1_NAME', 'USER1_TABLE', 'APP_USER1_TABLE'),
  };

  const user2: EnvUserConfig = {
    username: readEnv('USER2_USERNAME', 'APP_USER2_USERNAME'),
    password: readEnv('USER2_PASSWORD', 'APP_USER2_PASSWORD'),
    tableName: readEnv('TABLE2_NAME', 'USER2_TABLE', 'APP_USER2_TABLE'),
  };

  return [user1, user2].filter(
    (user) => user.username.length > 0 && user.password.length > 0 && user.tableName.length > 0,
  );
}

export function validateLogin(username: string, password: string): SessionUser | null {
  const normalizedUsername = username.trim();
  const users = getEnvUsers();

  const matchedUser = users.find(
    (user) => user.username === normalizedUsername && user.password === password,
  );

  if (!matchedUser) {
    return null;
  }

  return {
    username: matchedUser.username,
    tableName: normalizeTableName(matchedUser.tableName),
  };
}

function encodeSession(session: SessionUser): string {
  const serialized = JSON.stringify(session);
  return Buffer.from(serialized, 'utf8').toString('base64url');
}

function decodeSession(rawValue: string): SessionUser | null {
  try {
    const decoded = Buffer.from(rawValue, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as Partial<SessionUser>;

    if (!parsed.username || !parsed.tableName) {
      return null;
    }

    return {
      username: parsed.username,
      tableName: parsed.tableName,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeSession({ ...session, tableName: normalizeTableName(session.tableName) }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionValue) {
    return null;
  }

  const decodedSession = decodeSession(sessionValue);

  if (!decodedSession) {
    return null;
  }

  return {
    username: decodedSession.username,
    tableName: normalizeTableName(decodedSession.tableName),
  };
}
