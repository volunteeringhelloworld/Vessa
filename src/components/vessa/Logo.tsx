// Import the utility that combines CSS classes.
import { cn } from "@/lib/utils";

// Import the actual PNG file from the assets folder.
// Vite will automatically generate the correct image URL.
import logoAsset from "@/assets/vassa-logo.png";

// Keep this constant private to this file.
// This also avoids the React Fast Refresh warning.
const LOGO_URL = logoAsset;

// Display the normal VessA logo.
export function LogoMark({ className, alt = "Vessa" }: { className?: string; alt?: string }) {
  return (
    <img
      src={LOGO_URL}
      alt={alt}
      className={cn("select-none object-contain", className)}
      draggable={false}
    />
  );
}

// Display the VessA text wordmark.
export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-display font-light tracking-tight", className)}>Vessa</span>;
}

// Create the dimensional logo used on the success screen.
export function Logo3D({ className }: { className?: string }) {
  // Number of image layers used to create the 3D effect.
  const layers = 10;

  return (
    <div className={cn("relative [perspective:900px]", className)}>
      <div className="relative h-full w-full animate-float-tilt [transform-style:preserve-3d]">
        {/* Create multiple darker layers behind the main logo. */}
        {Array.from({ length: layers }).map((_, i) => (
          <img
            key={i}
            src={LOGO_URL}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              transform: `translateZ(${-i * 1.6}px)`,
              filter: `brightness(${0.92 - i * 0.045}) saturate(1.1)`,
            }}
          />
        ))}

        {/* Display the main logo on top of the layers. */}
        <img
          src={LOGO_URL}
          alt="Vessa"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain [filter:drop-shadow(0_1px_0_oklch(1_0_0/0.6))]"
          style={{ transform: "translateZ(1px)" }}
        />
      </div>

      {/* Add a soft shadow underneath the 3D logo. */}
      <div className="absolute -bottom-6 left-1/2 h-5 w-3/4 -translate-x-1/2 rounded-[50%] bg-terracotta/25 blur-xl" />
    </div>
  );
}


/** Shared wordmark used by the integrated booking and health-profile flows. */
export function VessaLogo({ className, size = 30 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-block shrink-0" style={{ width: size, height: size }}>
        <LogoMark className="h-full w-full" />
      </span>
      <span className="font-display text-[22px] font-semibold leading-none tracking-tight">
        Vess<span className="text-primary">A</span>
      </span>
    </span>
  );
}

/** Compact logo component expected by the health-profile onboarding screens. */
export function Logo({ className }: { className?: string }) {
  return <LogoMark className={cn("h-10 w-auto drop-shadow-sm", className)} />;
}
