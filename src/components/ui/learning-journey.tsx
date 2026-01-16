import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

type VideoBlock = {
  title: string;
  url: string;
  caption?: string;
};

export type BlockEntry = {
  id: string;
  date: string;
  rawDate: string; // ISO string for serialization
  title: string;
  kind: "text" | "video";
  content: string; // HTML content
  video?: VideoBlock;
};

type TimelineProps = {
  entries: BlockEntry[];
  onScrollTo: (id: string) => void;
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatDate = (date: Date) =>
  `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;

function Timeline({ entries, onScrollTo }: TimelineProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Group entries by date to get unique dates
  const uniqueDates = React.useMemo(() => {
    const seen = new Set<string>();
    return entries.filter((entry) => {
      if (seen.has(entry.date)) return false;
      seen.add(entry.date);
      return true;
    });
  }, [entries]);

  // Calculate time range and positions
  const positions = React.useMemo(() => {
    if (uniqueDates.length === 0) return [];

    const start = new Date(uniqueDates[0].rawDate).getTime();
    const end = new Date(uniqueDates[uniqueDates.length - 1].rawDate).getTime();
    const range = end - start;

    return uniqueDates.map((entry) => {
      if (range === 0) return 0;
      return ((new Date(entry.rawDate).getTime() - start) / range) * 100;
    });
  }, [uniqueDates]);

  return (
    <div className="fixed right-0 top-0 z-50 hidden h-screen lg:block">
      <div className="relative h-full">
        {uniqueDates.map((entry, index) => (
          <div
            key={entry.id}
            className="group absolute right-0 flex items-center "
            style={{ top: `${positions[index]}%` }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Tooltip */}
            <div
              className={`absolute right-12 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background transition-all duration-200 ${
                hoveredIndex === index
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-2 opacity-0"
              }`}
            >
              {entry.date}
            </div>

            {/* Tick mark */}
            <button
              onClick={() => onScrollTo(entry.id)}
              className="relative z-10 h-[2px] w-10 bg-muted-foreground/60 cursor-pointer transition-all duration-150 hover:w-14 hover:bg-foreground"
              aria-label={`Go to ${entry.date}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: VideoBlock }) {
  return (
    <div className="not-prose my-6 border border-border bg-[rgb(247, 247, 244)] shadow-[6px_6px_0_0_rgba(15,23,42,0.1)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[0.65rem] uppercase tracking-[0.3em]">
        <span>{video.title}</span>
        <span>Video</span>
      </div>
      <div className="aspect-video bg-[linear-gradient(135deg,rgba(255,200,100,0.35),rgba(90,120,255,0.25))]">
        <video
          className="h-full w-full object-cover"
          controls
          preload="metadata"
        >
          <source src={video.url} type="video/mp4" />
        </video>
      </div>
      {video.caption && (
        <div className="border-t border-border px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {video.caption}
        </div>
      )}
    </div>
  );
}

type LearningJourneyProps = {
  entries: BlockEntry[];
};

export default function LearningJourney({ entries }: LearningJourneyProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScrollTo = React.useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element && scrollRef.current) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <ScrollArea className="h-screen" ref={scrollRef}>
      <Timeline entries={entries} onScrollTo={handleScrollTo} />
      <section className="relative overflow-hidden font-[var(--font-editorial)] ">
        <div className="mx-auto max-w-7xl flex min-h-screen w-full py-0">
          <div className="grid w-full bg-[rgb(247, 247, 244)]">
            <main className="relative">
              <div className="p-6">
                <div className="border-b border-border pb-4">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
                      Change Log
                    </p>
                    <h2 className="mt-2 text-4xl font-[var(--font-display)] font-bold uppercase tracking-tight sm:text-5xl md:text-6xl">
                      Barry的英语学习之旅
                    </h2>
                  </div>
                </div>
                <div className="mt-8 space-y-8">
                  {entries.map((entry) => (
                    <article
                      id={entry.id}
                      key={entry.id}
                      className="grid gap-6 border-b border-border pb-8 md:grid-cols-[240px_1fr]"
                    >
                      <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground sm:text-sm">
                        {entry.date}
                      </div>
                      <div>
                        <h3 className="text-xl font-[var(--font-display)] uppercase tracking-tight">
                          {entry.title}
                        </h3>
                        <div className="prose mt-4 max-w-none font-[var(--font-editorial)] prose-headings:font-[var(--font-display)] prose-headings:uppercase prose-headings:tracking-tight prose-strong:text-foreground prose-blockquote:border-l-2 prose-blockquote:border-foreground/70 prose-blockquote:text-foreground/80 prose-a:text-foreground/80">
                          <div
                            dangerouslySetInnerHTML={{ __html: entry.content }}
                          />
                          {entry.video ? (
                            <VideoCard video={entry.video} />
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </ScrollArea>
  );
}
