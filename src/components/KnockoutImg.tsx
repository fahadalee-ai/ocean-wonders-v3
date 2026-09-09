import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { knockoutDarkBackground } from "@/lib/knockoutDark";

const cache = new Map<string, string>();
const CACHE_VER = "v4";

/** Punch out a light plate, then reuse the result for later mounts. */
export function useKnockoutSrc(src: string) {
  const key = `${CACHE_VER}:${src}`;
  const [url, setUrl] = useState(() => cache.get(key) ?? src);

  useEffect(() => {
    const hit = cache.get(key);
    if (hit) {
      setUrl(hit);
      return;
    }
    let alive = true;
    knockoutDarkBackground(src)
      .then((next) => {
        cache.set(key, next);
        if (alive) setUrl(next);
      })
      .catch(() => {
        if (alive) setUrl(src);
      });
    return () => {
      alive = false;
    };
  }, [src, key]);

  return url;
}

/** Renders an image after punching out its light-gray generator plate. */
export function KnockoutImg({ src, alt = "", ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const url = useKnockoutSrc(src);
  return <img src={url} alt={alt} {...rest} />;
}
