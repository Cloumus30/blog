import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  const validSecret = process.env.PREVIEW_SECRET || 'logikanya-secret-token-2026';
  if (secret !== validSecret) {
    return new Response('Invalid preview token', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  if (slug) {
    redirect(`/article/${slug}`);
  }
  redirect('/');
}
