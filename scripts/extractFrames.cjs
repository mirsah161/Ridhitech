const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);

const input = path.join(__dirname, "../public/videos/laptop.mp4");
const output = path.join(__dirname, "../public/lapFrames");

if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
}

console.log("Extracting frames...");

ffmpeg(input)
    .outputOptions([
        "-vf",
        "fps=20,scale=1920:-1",
        "-c:v",
        "libwebp",
        "-quality",
        "80"
    ])
    .output(path.join(output, "frame-%04d.webp"))
    .on("start", (command) => {
        console.log("FFmpeg started");
    })
    .on("progress", (progress) => {
        console.log(`Processed: ${progress.frames || 0} frames`);
    })
    .on("end", () => {
        console.log("✅ Frames extracted successfully!");
    })
    .on("error", (error) => {
        console.error("❌ Error:", error.message);
    })
    .run();