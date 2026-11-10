import { Link } from "@tanstack/react-router";
import { CalendarHeart } from "lucide-react";
import mascot from "@/assets/mascot-welcome.png";
import { Button } from "@/components/ui/button";
import { Screen } from "./Screen";
import { TopBar } from "./TopBar";
import { VessaLogo } from "./Logo";

/** Holding page for app sections outside the appointment feature. */
export function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <Screen nav>
      <TopBar center={<VessaLogo />} />
      <div className="glass animate-rise mt-6 flex flex-col items-center rounded-[28px] px-6 py-8 text-center">
        <img src={mascot} alt="" width={535} height={560} className="animate-float mb-4 h-32 w-auto" />
        <span className="rounded-full bg-butter px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cocoa">Coming soon</span>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight text-cocoa">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <Button asChild variant="cta" size="xl" className="mt-6 w-full">
          <Link to="/appointments">
            <CalendarHeart /> Go to Appointments
          </Link>
        </Button>
      </div>
    </Screen>
  );
}
