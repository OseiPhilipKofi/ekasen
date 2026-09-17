import { useEffect, useState } from "react";

export function useApiData(request, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    request()
      .then((result) => {
        if (active && result) setData(result);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [request]);
  return { data, loading, setData };
}
