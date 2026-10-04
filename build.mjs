import * as esbuild from "esbuild";

const options = {
  entryPoints: ["src/floorplan-card.ts"],
  bundle: true,
  outfile: "dist/floorplan-card.js",
  format: "esm",
  target: "es2021",
  minify: !process.argv.includes("--watch"),
  sourcemap: process.argv.includes("--watch"),
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}