import type { H3Event } from 'h3';
import { prisma } from './prisma';
import { serverSupabaseUser } from '#supabase/server';

export type RequestActor = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: Awaited<ReturnType<typeof serverSupabaseUser>>;
};

export async function getRequestActor(event: H3Event) {
  const user = await serverSupabaseUser(event);

  if (!user) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    };
  }

  const admin = await prisma.$queryRaw<{ user_id: string }[]>`
    select user_id
    from private.admin_users
    where user_id = ${user.sub}::uuid
    limit 1
  `;

  return {
    isAuthenticated: true,
    isAdmin: admin.length > 0,
    user,
  };
}
