import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const referer = request.headers.get('referer');
  if (referer) {
    redirect(referer);
  }
  redirect('/');
}
