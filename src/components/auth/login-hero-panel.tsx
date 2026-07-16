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
 * Narrow illustration rail (~35%) — one ambient mesh wash, grid bleed, UI preview.
 * Motion is deliberately limited to a single slow wash + gentle float.
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
      className={`relative flex min-h-[30vh] w-full shrink-0 flex-col justify-center overflow-hidden lg:min-h-0 lg:w-[35%] lg:max-w-none ${className}`}
    >
      {/* Decorative stack fades into the page background at the form-side edge
          (bottom when stacked on mobile, right on lg+) — no hard seam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_58%,transparent_98%)] lg:[mask-image:linear-gradient(to_right,black_55%,transparent_97%)]"
      >
        <div className="absolute inset-0 bg-surface-muted" />
        <div className="login-mesh-animate absolute inset-0 opacity-80" />

        {/* Corner radials — depth */}
        <div className="absolute -left-[20%] bottom-[-25%] h-[70%] w-[90%] rounded-full bg-secondary/15 blur-[100px]" />
        <div className="absolute -right-[30%] top-[-10%] h-[55%] w-[70%] rounded-full bg-primary/14 blur-[90px]" />

        {/* Grid bleeding past edges */}
        <div
          className="absolute -left-1/4 top-[8%] h-[115%] w-[150%] opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(148 163 184 / 38%) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184 / 38%) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(ellipse 95% 78% at 52% 44%, black 12%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 95% 78% at 52% 44%, black 12%, transparent 72%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center px-4 py-6 sm:px-5 sm:py-8 lg:py-8 lg:pl-8 lg:pr-6">
        <div className="relative w-full max-w-[min(92vw,340px)] lg:max-w-[min(100%,320px)]">
          <div
            aria-hidden
            className="absolute inset-[-18%] rounded-[2rem] bg-linear-to-br from-secondary/12 via-transparent to-primary/15 blur-3xl"
          />

          <LoginVisualParallax>
            <div className="login-illus-float relative overflow-hidden rounded-2xl border border-white/[0.12] bg-linear-to-b from-white/[0.14] via-white/[0.08] to-transparent p-3 shadow-[0_30px_90px_-26px_rgb(0_0_0/0.7)] ring-1 ring-white/[0.08] backdrop-blur-xl">
              <LoginUiPreviewArt title={illustrationAlt} className="aspect-[400/280] w-full" />
            </div>
          </LoginVisualParallax>
        </div>

        <div className="relative z-10 mt-7 max-w-[28ch] text-center lg:mt-6">
          <p className="text-balance text-[0.95rem] font-medium leading-snug tracking-tight text-foreground lg:text-base">
            {line1}
          </p>
          <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">{line2}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-2.5 py-1 text-[10px] font-medium text-foreground/80 backdrop-blur">
              <span aria-hidden className="size-1.5 rounded-full bg-success" />
              {heroChipLive}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-2.5 py-1 text-[10px] font-medium text-foreground/80 backdrop-blur">
              <span aria-hidden className="size-1.5 rounded-full bg-primary" />
              {heroChipMatched}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
