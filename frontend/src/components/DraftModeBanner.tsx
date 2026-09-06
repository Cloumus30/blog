import { draftMode } from 'next/headers';
import Link from 'next/link';
import { Eye, LogOut } from 'lucide-react';

export default async function DraftModeBanner() {
  const { isEnabled } = await draftMode();

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-[#D95D39] text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
          <span className="truncate">
            <strong className="font-semibold">Mode Preview Aktif:</strong> Anda sedang melihat draf artikel sebelum dipublikasikan.
          </span>
        </div>
        <Link
          href="/api/exit-preview"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold transition-colors backdrop-blur-xs border border-white/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Preview</span>
        </Link>
      </div>
    </div>
  );
}
