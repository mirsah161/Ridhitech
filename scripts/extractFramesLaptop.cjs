const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);

const input = path.join(__dirname, "../public/videos/laptop.mp4");
// 1. Updated output directory for laptop frames
const output = path.join(__dirname, "../public/lapFrames");

if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
}

// 2. Updated console starting log
console.log("Extracting laptop lapFrames...");

ffmpeg(input)
    .outputOptions([
        "-vf",
        // 3. Increased width from 1080 to 1920 (or your preferred desktop width) for high-res laptop viewports
        "fps=20,scale=1920:-1",
        "-c:v",
        "libwebp",
        "-quality",
        "75"
    ])
    .output(path.join(output, "frame-%04d.webp"))
    .on("start", (command) => {
        console.log("FFmpeg started");
    })
    .on("progress", (progress) => {
        console.log(`Processed: ${progress.frames || 0} frames`);
    })
    .on("end", () => {
        // 4. Updated completion log
        console.log("✅ Laptop lapFrames extracted successfully!");
    })
    .on("error", (error) => {
        console.error("❌ Error:", error.message);
    })
    .run();