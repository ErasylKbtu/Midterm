import {
  Braces,
  ChartNoAxesCombined,
  Palette,
  BriefcaseBusiness,
  Sparkles,
  Megaphone,
  CalendarCheck2,
  ShieldCheck,
} from "lucide-react";
export { CATEGORIES, LEVELS } from "./catalog.js";
const THEMES = {
  Development: {
    icon: Braces,
    tone: "development",
    short: "Make it work.",
    label: "CODE / CREATE / REPEAT",
    symbol: "</>",
  },
  "Data Science": {
    icon: ChartNoAxesCombined,
    tone: "data",
    short: "Find the story.",
    label: "EXPLORE THE NUMBERS",
    symbol: "data.",
  },
  Design: {
    icon: Palette,
    tone: "design",
    short: "Think in color.",
    label: "IDEAS INTO EXPERIENCES",
    symbol: "Aa",
  },
  Business: {
    icon: BriefcaseBusiness,
    tone: "business",
    short: "Build what’s next.",
    label: "STRATEGY MEETS ACTION",
    symbol: "↗",
  },
  "AI & Automation": {
    icon: Sparkles,
    tone: "ai",
    short: "Work smarter.",
    label: "HUMAN IDEAS. NEW TOOLS.",
    symbol: "✳",
  },
  Marketing: {
    icon: Megaphone,
    tone: "marketing",
    short: "Make some noise.",
    label: "CONNECT / CREATE / GROW",
    symbol: "hey!",
  },
  Productivity: {
    icon: CalendarCheck2,
    tone: "productivity",
    short: "Small steps. Big ideas.",
    label: "MAKE ROOM FOR FOCUS",
    symbol: "✓",
  },
  Cybersecurity: {
    icon: ShieldCheck,
    tone: "cybersecurity",
    short: "Stay one step ahead.",
    label: "THINK / PROTECT / SECURE",
    symbol: "{ }",
  },
};
export function getCourseTheme(category) {
  return THEMES[category] ?? THEMES.Development;
}
export function formatDuration(hours) {
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}
export function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}
