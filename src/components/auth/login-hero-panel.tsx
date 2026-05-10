import { LoginUiPreviewArt } from "@/components/auth/login-ui-preview-art";
import { LoginVisualParallax } from "@/components/auth/login-visual-parallax";

type Props = Readonly<{
  line1: string;
  line2: string;
  illustrationAlt: string;
  heroChipLive: string;
  heroChipMatched: string;
  className?: string;
}>;

/**
 * Narrow illustration rail (~35%) — ambient depth, grid bleed, UI preview + parallax.
 */
export function LoginHeroPanel({
  line1,
  line2,
  illustrationAlt,
  heroChipLive,
  heroChipMatched,
  className = "",
}: Props) {
  return (
    <div
      className={`relative flex min-h-[38vh] w-full shrink-0 flex-col justify-center overflow-hidden bg-zinc-950 lg:min-h-0 lg:w-[35%] lg:max-w-none ${className}`}
    >
      {/* Corner radial — depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[20%] bottom-[-25%] h-[70%] w-[90%] rounded-full bg-emerald-500/14 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[30%] top-[-10%] h-[55%] w-[70%] rounded-full bg-indigo-500/12 blur-[90px]"
      />
      <div
        aria-hidden
        className="login-blob-2 pointer-events-none absolute left-[10%] top-[50%] h-[200px] w-[200px] rounded-full bg-teal-400/10 blur-3xl"
      />

      {/* Grid bleeding past edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-[8%] h-[115%] w-[150%] opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(148 163 184 / 38%) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184 / 38%) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 95% 78% at 52% 44%, black 12%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 78% at 52% 44%, black 12%, transparent 72%)",
        }}
      />

      <div
        className="login-grid-pan pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full flex-col items-center px-5 py-9 lg:py-8 lg:pl-8 lg:pr-6">
        <div className="relative w-full max-w-[min(92vw,340px)] lg:max-w-[min(100%,320px)]">
          <div
            aria-hidden
            className="absolute inset-[-18%] rounded-[2rem] bg-linear-to-br from-emerald-500/12 via-transparent to-indigo-500/15 blur-3xl"
          />

          <LoginVisualParallax>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-linear-to-b from-white/[0.07] to-transparent p-3 shadow-[0_24px_80px_-24px_rgb(0_0_0/0.65)] ring-1 ring-white/[0.06] backdrop-blur-md">
              <LoginUiPreviewArt title={illustrationAlt} className="aspect-[400/280] w-full" />
            </div>
          </LoginVisualParallax>

          <div
            aria-hidden
            className="login-chip-drift pointer-events-none absolute -right-0.5 top-[6%] hidden rounded-full border border-emerald-400/35 bg-emerald-500/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100 shadow-sm backdrop-blur-md md:block"
          >
            {heroChipLive}
          </div>
          <div
            aria-hidden
            className="login-chip-drift-rev pointer-events-none absolute -left-2 bottom-[14%] hidden rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-100 shadow-sm backdrop-blur-md md:block"
          >
            {heroChipMatched}
          </div>
        </div>

        <div className="relative z-10 mt-7 max-w-[28ch] text-center lg:mt-6">
          <p className="text-balance text-[0.95rem] font-medium leading-snug tracking-tight text-zinc-100 lg:text-base">
            {line1}
          </p>
          <p className="mt-2 text-pretty text-xs leading-relaxed text-zinc-500">{line2}</p>
        </div>
      </div>
    </div>
  );
}
