/**
 * Site-wide ambient layer (v1.3): a faint masked grid plus near-transparent
 * geometric shapes spread down the WHOLE document. Absolute (anchored by
 * `body { position: relative }`), so everything scrolls with the page instead
 * of sticking to the viewport; `.parallax-*` wrappers add scroll-linked drift
 * at different speeds (progressive enhancement). Pure CSS, token colors →
 * theme-aware, frozen under prefers-reduced-motion.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Fine grid fading out from the top of the document */}
      <div className="ambient-grid absolute inset-x-0 top-0 h-[52rem] opacity-55 dark:opacity-40" />

      {/* Soft color washes at different depths */}
      <div className="parallax-sink absolute -left-[12%] top-[4rem] h-[26rem] w-[26rem] rounded-full bg-primary/12 blur-3xl dark:bg-primary/20" />
      <div className="parallax-rise absolute right-[-10%] top-[46rem] h-[24rem] w-[24rem] rounded-full bg-secondary/12 blur-3xl dark:bg-secondary/16" />
      <div className="parallax-sink absolute left-[24%] top-[110rem] h-[22rem] w-[22rem] rounded-full bg-accent/8 blur-3xl dark:bg-accent/10" />

      {/* Small geometry spread down the page — new pieces enter as you scroll. */}
      <span className="parallax-rise absolute left-[8%] top-[14rem] hidden sm:block">
        <span className="drift-a block size-16 rounded-2xl border border-primary/25 dark:border-primary/30" />
      </span>
      <span className="parallax-sink absolute right-[10%] top-[10rem] hidden sm:block">
        <span className="drift-b block size-10 rounded-full border-2 border-secondary/30 dark:border-secondary/35" />
      </span>
      <span className="parallax-rise absolute left-[16%] top-[42rem] hidden sm:block">
        <span className="drift-c block size-6 rounded-full bg-accent/20 dark:bg-accent/25" />
      </span>
      <span className="parallax-turn absolute right-[14%] top-[54rem] hidden sm:block">
        <span className="drift-b block size-12 rotate-12 rounded-xl border border-border" />
      </span>
      <span className="parallax-rise absolute left-[46%] top-[66rem] hidden sm:block">
        <svg
          className="spin-very-slow size-14 text-primary/15 dark:text-primary/20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
        >
          <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" strokeLinecap="round" />
        </svg>
      </span>
      <span className="parallax-sink absolute left-[6%] top-[88rem] hidden md:block">
        <span className="drift-a block size-9 rounded-full border-2 border-primary/20 dark:border-primary/25" />
      </span>
      <span className="parallax-turn absolute right-[7%] top-[100rem] hidden md:block">
        <span className="drift-c block size-14 rounded-2xl border border-secondary/20 dark:border-secondary/25" />
      </span>
      <span className="parallax-rise absolute right-[28%] top-[126rem] hidden md:block">
        <span className="drift-b block size-7 rotate-45 rounded-lg bg-primary/10 dark:bg-primary/15" />
      </span>
    </div>
  );
}
