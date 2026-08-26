import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "src/app/icon.svg"));

const png48 = await sharp(svg).resize(48, 48).png().toBuffer();
const png96 = await sharp(svg).resize(96, 96).png().toBuffer();
const png180 = await sharp(svg).resize(180, 180).png().toBuffer();
const png192 = await sharp(svg).resize(192, 192).png().toBuffer();
const ico = await toIco([png48, png96]);

writeFileSync(join(root, "public/favicon.ico"), ico);
writeFileSync(join(root, "public/icon-48.png"), png48);
writeFileSync(join(root, "public/icon-192.png"), png192);
writeFileSync(join(root, "public/apple-icon.png"), png180);
writeFileSync(join(root, "src/app/icon.png"), png96);

console.log("Generated favicon.ico and PNG icons.");
