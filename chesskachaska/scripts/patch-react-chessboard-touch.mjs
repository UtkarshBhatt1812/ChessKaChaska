import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  path.join(__dirname, "..", "node_modules", "react-chessboard", "dist", "index.js"),
  path.join(__dirname, "..", "node_modules", "react-chessboard", "dist", "index.esm.js"),
];

const search = `            // Prevent default to avoid double-firing with onClick on some devices
            e.preventDefault();`;

const replacement = `            // Prevent default when possible to avoid duplicate taps without triggering
            // Chrome's non-cancelable touchend intervention warning during scroll.
            if (e.cancelable) {
                e.preventDefault();
            }`;

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(search) || source.includes("Chrome's non-cancelable touchend intervention warning")) {
    continue;
  }

  fs.writeFileSync(file, source.replace(search, replacement), "utf8");
  console.log(`Patched react-chessboard touch handler: ${path.relative(process.cwd(), file)}`);
}
