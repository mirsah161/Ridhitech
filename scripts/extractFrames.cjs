const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);

const input = path.join(__dirname, "../public/videos/laptop.mp4");
const output = path.join(__dirname, "../public/lapFrames-mobile");

if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
}

console.log("Extracting mobile lapFrames...");

ffmpeg(input)
    .outputOptions([
        "-vf",
        // PERFORMANCE: ~55% of the desktop 1920 width used in the original
        // extractFrames.cjs — visually identical on phone viewports since
        // the canvas scales via drawImage anyway, but a much lighter
        // payload per frame. Adjust 1080 if the source aspect ratio needs it.
        "fps=20,scale=1080:-1",
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
        console.log("✅ Mobile lapFrames extracted successfully!");
    })
    .on("error", (error) => {
        console.error("❌ Error:", error.message);
    })
    .run();
