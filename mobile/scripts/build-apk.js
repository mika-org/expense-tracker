const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const isWin = os.platform() === "win32";
const gradlewCmd = isWin ? "gradlew.bat" : "./gradlew";
const androidDir = path.join(__dirname, "..", "android");

console.log("🚀 Memulai proses build APK Android Release...");
console.log(`📁 Lokasi kerja: ${androidDir}\n`);

const child = spawn(path.join(androidDir, gradlewCmd), ["assembleRelease"], {
  cwd: androidDir,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  if (code === 0) {
    console.log("\n=======================================================");
    console.log("✅ BUILD APK SUKSES!");
    console.log("📦 Lokasi APK:");
    console.log(path.join(androidDir, "app", "build", "outputs", "apk", "release", "app-release.apk"));
    console.log("=======================================================\n");
  } else {
    console.error(`\n❌ Build gagal dengan status error code: ${code}\n`);
    process.exit(code || 1);
  }
});
