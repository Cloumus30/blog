interface VideoEmbedProps {
  url: string;
  caption?: string;
}

export default function VideoEmbed({ url, caption }: VideoEmbedProps) {
  // Ekstraksi YouTube Video ID
  const getYouTubeId = (videoUrl: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="my-6 p-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-sm">
        Video URL tidak valid atau tidak didukung: <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{url}</a>
      </div>
    );
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

  return (
    <figure className="my-8">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title={caption || 'Embedded Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-center text-xs text-slate-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
