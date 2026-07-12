"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | CustomSelectOption)[];
  placeholder?: string;
  className?: string;
}

function normalizeOption(option: string | CustomSelectOption): CustomSelectOption {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export function CustomSelect({ id, value, onChange, options, placeholder, className }: CustomSelectProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedOptions = options.map(normalizeOption);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedLabel = normalizedOptions.find((option) => option.value === value)?.label ?? placeholder ?? "All";

  const optionClass = (isSelected: boolean): string =>
    cn(
      "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#ED017F] hover:text-white",
      isSelected ? "bg-[#ED017F] text-white" : "text-gray-700",
    );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700
                  outline-none transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#232B2B]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
        >
          {placeholder !== undefined && (
            <li>
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className={optionClass(value === "")}
              >
                {placeholder}
              </button>
            </li>
          )}
          {normalizedOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={optionClass(value === option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
