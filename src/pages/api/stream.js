// 1. pages/api/stream.js
import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { rtspUrl } = req.query;
  if (!rtspUrl) return res.status(400).json({ error: "RTSP URL kerak" });

  const streamId = Buffer.from(rtspUrl).toString("base64").replace(/=/g, "");
  const outputDir = path.join(process.cwd(), "public", "streams", streamId);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const playlistPath = path.join(outputDir, "index.m3u8");

  const ffmpegArgs = [
    "-rtsp_transport",
    "tcp",
    "-i",
    rtspUrl,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-tune",
    "zerolatency",
    "-f",
    "hls",
    "-hls_time",
    "2", // har bir segment uzunligi
    "-hls_list_size",
    "10", // HLS playlist uzunligi
    "-hls_flags",
    "program_date_time+split_by_time", // segmentni o‘chirmaslik
    "-hls_segment_filename",
    `${outputDir}/segment-%03d.ts`,
    playlistPath,
  ];

  const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

  ffmpeg.stderr.on("data", (data) => {
    console.log("FFmpeg log:", data.toString());
  });

  ffmpeg.on("close", (code) => {
    console.log(`FFmpeg tugadi. Exit code: ${code}`);
  });

  // .m3u8 fayl tayyor bo'lishini kutamiz (maks 5 soniya)
  let retries = 0;
  const maxRetries = 10;

  const waitForFile = () =>
    new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (fs.existsSync(playlistPath)) {
          clearInterval(interval);
          resolve();
        } else if (retries++ > maxRetries) {
          clearInterval(interval);
          reject(new Error("Stream fayli topilmadi"));
        }
      }, 500);
    });

  try {
    await waitForFile();
    res.status(200).json({
      success: true,
      hlsUrl: `/streams/${streamId}/index.m3u8`,
      streamId,
    });
  } catch (err) {
    res.status(500).json({ error: "Streamni yaratib bo'lmadi." });
  }
}
