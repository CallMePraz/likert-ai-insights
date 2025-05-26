import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SearchInputProps {
  onSearch: (term: string) => void;
  value: string;
  placeholder?: string;
  isLoading?: boolean;
}

export function SearchInput({ 
  onSearch, 
  value, 
  placeholder = "Search responses...", 
  isLoading = false 
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, value, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onSearch("");
  };

  return (
    <div className="relative">
      <Input
        id="search-input"
        name="search"
        placeholder={placeholder}
        value={localValue}
        onChange={handleSearchChange}
        className="max-w-sm"
        disabled={isLoading}
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {isLoading && (
        <Loader2 className="animate-spin absolute right-2 top-1/2 -translate-y-1/2" />
      )}
    </div>
  );
}
