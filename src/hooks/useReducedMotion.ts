import { useEffect, useState } from "react";

const STORAGE_KEY = "reduceMotion";
const MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

function getSystemPreference() {
  return window.matchMedia(MEDIA_QUERY).matches;
}

export function useReducedMotion() {
  const [userReducedMotion, setUserReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const [systemReducedMotion, setSystemReducedMotion] = useState(getSystemPreference);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    const handleChange = () => setSystemReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const reduceMotion = userReducedMotion || systemReducedMotion;

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  function toggleReducedMotion() {
    setUserReducedMotion((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return {
    reduceMotion,
    toggleReducedMotion,
  };
}
