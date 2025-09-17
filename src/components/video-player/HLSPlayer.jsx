import Hls from "hls.js";
import { useEffect, useRef } from "react";

export default function HLSPlayer({ src }) {
  const videoRef = useRef();

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <video ref={videoRef} controls autoPlay muted className="mt-4 w-full" />
  );
}
