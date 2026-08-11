"use client";

import { useEffect, useState } from "react";
import { SunMedium } from "lucide-react";
import { Moon } from "lucide-react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const currTheme = localStorage.getItem("theme");

    if (currTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const theme = !dark;

    if (theme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setDark(theme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      {dark ? (
        <>
          <SunMedium />
        </>
      ) : (
        <>
          <Moon />
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
