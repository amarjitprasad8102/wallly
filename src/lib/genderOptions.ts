// Shared, inclusive gender / identity options used across the app.
// Covers gender identity, sexual orientation, and role preferences so
// every user can self-describe and filter accordingly.

export interface GenderOption {
  value: string;
  label: string;
  // Grouping is purely cosmetic — used to render section headings in selects.
  group: "Identity" | "Orientation" | "Role" | "Other";
}

export const GENDER_OPTIONS: GenderOption[] = [
  // Identity
  { value: "male", label: "Male", group: "Identity" },
  { value: "female", label: "Female", group: "Identity" },
  { value: "non_binary", label: "Non-binary", group: "Identity" },
  { value: "transgender_male", label: "Transgender Male", group: "Identity" },
  { value: "transgender_female", label: "Transgender Female", group: "Identity" },
  { value: "genderfluid", label: "Gender Fluid", group: "Identity" },
  { value: "genderqueer", label: "Genderqueer", group: "Identity" },
  { value: "agender", label: "Agender", group: "Identity" },
  { value: "two_spirit", label: "Two-Spirit", group: "Identity" },
  { value: "intersex", label: "Intersex", group: "Identity" },

  // Orientation
  { value: "gay", label: "Gay", group: "Orientation" },
  { value: "lesbian", label: "Lesbian", group: "Orientation" },
  { value: "bisexual", label: "Bisexual", group: "Orientation" },
  { value: "pansexual", label: "Pansexual", group: "Orientation" },
  { value: "asexual", label: "Asexual", group: "Orientation" },
  { value: "demisexual", label: "Demisexual", group: "Orientation" },
  { value: "queer", label: "Queer", group: "Orientation" },
  { value: "straight", label: "Straight / Heterosexual", group: "Orientation" },
  { value: "questioning", label: "Questioning", group: "Orientation" },

  // Role
  { value: "top", label: "Top", group: "Role" },
  { value: "bottom", label: "Bottom", group: "Role" },
  { value: "versatile", label: "Versatile", group: "Role" },
  { value: "switch", label: "Switch", group: "Role" },

  // Other
  { value: "other", label: "Other", group: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say", group: "Other" },
];

export const GROUPED_GENDER_OPTIONS = (() => {
  const groups: Record<string, GenderOption[]> = {};
  for (const opt of GENDER_OPTIONS) {
    (groups[opt.group] ||= []).push(opt);
  }
  return groups;
})();

// Display order of groups in select menus.
export const GENDER_GROUP_ORDER: Array<GenderOption["group"]> = [
  "Identity",
  "Orientation",
  "Role",
  "Other",
];
