import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

const EXPECTED_SECRET = process.env.REVALIDATION_SECRET || 'logikanya-secret-token-2026';

function verifySecret(request: NextRequest): boolean {
  const querySecret = request.nextUrl.searchParams.get('secret');
  if (querySecret && querySecret === EXPECTED_SECRET) return true;

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === EXPECTED_SECRET) return true;
  }

  const customHeader = request.headers.get('x-strapi-secret');
  if (customHeader && customHeader === EXPECTED_SECRET) return true;

  return false;
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid revalidation secret token' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { event, model, entry } = body;

    const revalidated: string[] = [];

    // Purge cached Strapi fetch calls
    revalidateTag('articles', 'max');
    revalidated.push('tag:articles');

    // Selalu revalidasi beranda
    revalidatePath('/', 'page');
    revalidated.push('path:/');

    // Revalidasi sitemap dan RSS feed
    revalidatePath('/sitemap.xml', 'page');
    revalidatePath('/feed.xml', 'page');
    revalidated.push('path:/sitemap.xml', 'path:/feed.xml');

    if (model === 'article' && entry?.slug) {
      revalidatePath(`/article/${entry.slug}`, 'page');
      revalidated.push(`path:/article/${entry.slug}`);
    } else if (model === 'category' && entry?.slug) {
      revalidatePath(`/category/${entry.slug}`, 'page');
      revalidated.push(`path:/category/${entry.slug}`);
    } else if (model === 'tag' && entry?.slug) {
      revalidatePath(`/tag/${entry.slug}`, 'page');
      revalidated.push(`path:/tag/${entry.slug}`);
    } else {
      // Revalidasi wildcard untuk seluruh rute dinamis jika model tidak spesifik
      revalidatePath('/article/[slug]', 'page');
      revalidatePath('/category/[slug]', 'page');
      revalidatePath('/author/[slug]', 'page');
      revalidatePath('/tag/[slug]', 'page');
      revalidated.push('all dynamic routes');
    }

    return NextResponse.json({
      revalidated: true,
      event: event || 'manual',
      model: model || 'all',
      targets: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Error during on-demand revalidation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid revalidation secret token' },
      { status: 401 }
    );
  }

  const path = request.nextUrl.searchParams.get('path');
  const tag = request.nextUrl.searchParams.get('tag');

  if (tag) {
    revalidateTag(tag, 'max');
    return NextResponse.json({ revalidated: true, tag, timestamp: new Date().toISOString() });
  }

  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, timestamp: new Date().toISOString() });
  }

  // Default GET revalidation: revalidasi tag artikel & beranda
  revalidateTag('articles', 'max');
  revalidatePath('/', 'page');
  revalidatePath('/sitemap.xml', 'page');
  revalidatePath('/feed.xml', 'page');

  return NextResponse.json({
    revalidated: true,
    message: 'Global cache purged successfully',
    targets: ['tag:articles', 'path:/', 'path:/sitemap.xml', 'path:/feed.xml'],
    timestamp: new Date().toISOString(),
  });
}
