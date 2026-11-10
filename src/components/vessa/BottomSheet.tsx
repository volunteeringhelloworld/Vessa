import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[2rem] border-glass-border bg-popover px-6 pb-safe pt-3"
      >
        <div aria-hidden className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <SheetHeader className="mb-5 text-left">
          <SheetTitle className="font-display text-2xl font-normal">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-muted-foreground">{description}</SheetDescription>
          )}
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
