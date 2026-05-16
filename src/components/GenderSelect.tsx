import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GENDER_GROUP_ORDER,
  GROUPED_GENDER_OPTIONS,
} from "@/lib/genderOptions";

interface GenderSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Prepend an "Any" option — for match-preference selectors. */
  includeAny?: boolean;
  anyLabel?: string;
}

const GenderSelect = ({
  value,
  onValueChange,
  id,
  placeholder = "Select gender",
  disabled,
  includeAny = false,
  anyLabel = "Any Gender",
}: GenderSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[320px]">
        {includeAny && (
          <SelectGroup>
            <SelectItem value="any">{anyLabel}</SelectItem>
          </SelectGroup>
        )}
        {GENDER_GROUP_ORDER.map((group) => (
          <SelectGroup key={group}>
            <SelectLabel>{group}</SelectLabel>
            {GROUPED_GENDER_OPTIONS[group]?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default GenderSelect;
