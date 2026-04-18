"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface AddressAutocompleteProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function AddressAutocomplete({ id, placeholder, value, onChange, onBlur }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(true);
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchAddress(newValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSelect = (suggestion: Suggestion) => {
    onChange(suggestion.display_name);
    setIsOpen(false);
    if (onBlur) {
        // give it a tiny bit to update state before triggering blur calculation
        setTimeout(() => onBlur(), 100);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
      <Input
        id={id}
        placeholder={placeholder}
        className="pl-8"
        value={value}
        onChange={handleInputChange}
        onBlur={() => {
            // Delay blur to allow clicking on suggestion
            setTimeout(() => {
                if (onBlur) onBlur();
            }, 200)
        }}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
