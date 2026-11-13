import {
  Coffee,
  ShoppingBag,
  Home,
  Tv,
  Briefcase,
  Car,
  Utensils,
  HeartPulse,
  Layers,
  Zap,
  BookOpen,
  Send,
} from "lucide-react";

export function getCategoryIcon(name = "") {
  const lower = name.toLowerCase();

  if (lower.includes("starbucks") || lower.includes("coffee") || lower.includes("cafe")) {
    return {
      icon: Coffee,
      bg: "bg-emerald-100 text-emerald-700",
      pillBg: "#E8F5E9",
    };
  }
  if (lower.includes("food") || lower.includes("restaurant") || lower.includes("dining")) {
    return {
      icon: Utensils,
      bg: "bg-amber-100 text-amber-700",
      pillBg: "#FEF3C7",
    };
  }
  if (lower.includes("youtube") || lower.includes("netflix") || lower.includes("movie") || lower.includes("entertainment")) {
    return {
      icon: Tv,
      bg: "bg-rose-100 text-rose-600",
      pillBg: "#FFE4E6",
    };
  }
  if (lower.includes("shopping") || lower.includes("cloth") || lower.includes("amazon")) {
    return {
      icon: ShoppingBag,
      bg: "bg-indigo-100 text-indigo-700",
      pillBg: "#E0E7FF",
    };
  }
  if (lower.includes("rent") || lower.includes("home") || lower.includes("house")) {
    return {
      icon: Home,
      bg: "bg-teal-100 text-[#2F7E79]",
      pillBg: "#CCFBF1",
    };
  }
  if (lower.includes("travel") || lower.includes("transport") || lower.includes("fuel") || lower.includes("uber") || lower.includes("car")) {
    return {
      icon: Car,
      bg: "bg-blue-100 text-blue-700",
      pillBg: "#DBEAFE",
    };
  }
  if (lower.includes("bill") || lower.includes("utility") || lower.includes("electricity")) {
    return {
      icon: Zap,
      bg: "bg-yellow-100 text-yellow-700",
      pillBg: "#FEF9C3",
    };
  }
  if (lower.includes("salary") || lower.includes("upwork") || lower.includes("freelance") || lower.includes("income")) {
    return {
      icon: Briefcase,
      bg: "bg-emerald-100 text-[#25A969]",
      pillBg: "#D1FAE5",
    };
  }
  if (lower.includes("transfer") || lower.includes("send") || lower.includes("paypal")) {
    return {
      icon: Send,
      bg: "bg-cyan-100 text-cyan-700",
      pillBg: "#CFFAFE",
    };
  }
  if (lower.includes("health") || lower.includes("medical") || lower.includes("fitness")) {
    return {
      icon: HeartPulse,
      bg: "bg-pink-100 text-pink-700",
      pillBg: "#FCE7F3",
    };
  }
  if (lower.includes("education") || lower.includes("course") || lower.includes("book")) {
    return {
      icon: BookOpen,
      bg: "bg-violet-100 text-violet-700",
      pillBg: "#EDE9FE",
    };
  }

  // Default fallback
  return {
    icon: Layers,
    bg: "bg-teal-50 text-[#2F7E79]",
    pillBg: "#EEF8F7",
  };
}
