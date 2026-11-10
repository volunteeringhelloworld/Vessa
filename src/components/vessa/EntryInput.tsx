import { Plus } from "lucide-react";

import { ChoiceChip } from "./ChoiceChip";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  items: string[];
  onRemove: (v: string) => void;
  placeholder?: string;
  label: string;
}

/** Text field with a (+) button that collects multiple entries as removable chips. */
export function EntryInput({ value, onChange, onAdd, items, onRemove, placeholder, label }: Props) {
  return (
    <div className="w-full">
      <form
        className="flex items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd();
        }}
      >
        <label className="sr-only" htmlFor="entry-input">
          {label}
        </label>
        <input
          id="entry-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="glass h-14 min-w-0 flex-1 rounded-full px-5 text-base text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-coral"
        />
        <button
          type="submit"
          aria-label={`Add ${label.toLowerCase()}`}
          disabled={!value.trim()}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-primary text-ink shadow-lift transition-all active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          <Plus className="h-6 w-6" strokeWidth={2.25} />
        </button>
      </form>
      {items.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Added entries">
          {items.map((item) => (
            <ChoiceChip key={item} kind="remove" onClick={() => onRemove(item)} aria-label={`Remove ${item}`}>
              {item}
            </ChoiceChip>
          ))}
        </div>
      )}
    </div>
  );
}
