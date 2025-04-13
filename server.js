import express from "express";
import cors from "cors";
import esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.post("/transpile", async (req, res) => {
  const { code } = req.body;
  console.log("Received code:", code);
  try {
    const tempFile = path.join(__dirname, "temp.jsx");
    const outputFile = path.join(__dirname, "output.js");
    console.log("Writing to:", tempFile);
    writeFileSync(tempFile, code, "utf8");
    console.log("Temp file content:", readFileSync(tempFile, "utf8"));

    console.log("Starting esbuild...");
    await esbuild.build({
      entryPoints: [tempFile],
      outfile: outputFile,
      bundle: true,
      platform: "browser",
      format: "iife",
      globalName: "AppBundle",
      define: { "process.env.NODE_ENV": '"development"' },
      loader: { ".jsx": "jsx" },
      nodePaths: [path.join(__dirname, "node_modules")],
      external: ["react", "react-dom", "react-dom/client"], // Ensure all are external
      inject: [path.join(__dirname, "react-shim.js")], // Shim for globals
    });
    console.log("Esbuild completed. Checking output file...");

    if (!existsSync(outputFile)) {
      throw new Error(`Output file not created: ${outputFile}`);
    }

    const bundledCode = readFileSync(outputFile, "utf8");
    console.log("Bundled code:", bundledCode);

    unlinkSync(tempFile);
    unlinkSync(outputFile);

    res.json({ success: true, code: bundledCode });
  } catch (error) {
    console.error("Build Error:", error);
    res.json({ success: false, error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
