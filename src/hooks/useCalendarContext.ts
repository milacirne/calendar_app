import { useEffect, useState } from "react";
import { getCalendarContext } from "../services/authService";
import type { CalendarContextState } from "../types/calendar";

export function useCalendarContext() {
  const [context, setContext] = useState<CalendarContextState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCalendarContext()
      .then((result) => {
        if (isMounted) {
          setContext(result);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { context, isLoading };
}
