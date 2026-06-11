import type { H3Event } from 'h3';
import { prisma } from './prisma';
import { serverSupabaseUser } from '#supabase/server';

export async function getRequestActor(event: H3Event) {
  const user = await serverSupabaseUser(event);

  if (!user) {
    return {
      isAdmin: false,
      user: null,
    };
  }

  const admin = await prisma.$queryRaw<{ is_admin: boolean }[]>`
    select private.is_admin() as is_admin
  `;

  return {
    isAdmin: Boolean(admin[0]?.is_admin),
    user,
  };
}
