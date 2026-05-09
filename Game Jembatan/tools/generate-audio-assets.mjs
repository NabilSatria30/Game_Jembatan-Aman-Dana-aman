import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sampleRate = 44100;

function writeWav(file, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buffer);
}

function tone({ duration, frequency, type = "sine", gain = 0.32, attack = 0.01, release = 0.08 }) {
  const length = Math.floor(duration * sampleRate);
  return Array.from({ length }, (_, i) => {
    const t = i / sampleRate;
    const phase = t * frequency;
    const wave = type === "triangle"
      ? 2 * Math.abs(2 * (phase - Math.floor(phase + 0.5))) - 1
      : type === "saw"
        ? 2 * (phase - Math.floor(phase + 0.5))
        : Math.sin(Math.PI * 2 * phase);
    const env = Math.min(1, t / attack, (duration - t) / release);
    return wave * gain * Math.max(0, env);
  });
}

function concat(...chunks) {
  return chunks.flat();
}

function rest(duration) {
  return Array.from({ length: Math.floor(duration * sampleRate) }, () => 0);
}

function musicLoop() {
  const notes = [392, 440, 523.25, 587.33, 523.25, 440, 392, 329.63];
  const out = [];
  for (let bar = 0; bar < 6; bar += 1) {
    for (const note of notes) {
      const lead = tone({ duration: 0.32, frequency: note, type: "triangle", gain: 0.12, release: 0.12 });
      const bass = tone({ duration: 0.32, frequency: note / 2, type: "sine", gain: 0.08, release: 0.16 });
      out.push(...lead.map((v, i) => v + bass[i] * 0.85));
    }
  }
  return out;
}

const assets = [
  ["assets/sfx/click.wav", tone({ duration: 0.08, frequency: 560, type: "triangle", gain: 0.2, release: 0.04 })],
  ["assets/sfx/good.wav", concat(tone({ duration: 0.09, frequency: 660, gain: 0.22 }), tone({ duration: 0.12, frequency: 880, gain: 0.18 }))],
  ["assets/sfx/bad.wav", tone({ duration: 0.22, frequency: 132, type: "saw", gain: 0.16, release: 0.18 })],
  ["assets/sfx/win.wav", concat(tone({ duration: 0.16, frequency: 523.25, gain: 0.18 }), tone({ duration: 0.16, frequency: 659.25, gain: 0.18 }), tone({ duration: 0.28, frequency: 783.99, gain: 0.18 }))],
  ["assets/sfx/lose.wav", concat(tone({ duration: 0.24, frequency: 146.83, type: "saw", gain: 0.14 }), rest(0.03), tone({ duration: 0.32, frequency: 98, type: "saw", gain: 0.13 }))],
  ["assets/bgm/clean-project-loop.wav", musicLoop()]
];

for (const [relative, samples] of assets) {
  writeWav(join(root, relative), samples);
}

console.log(`Generated ${assets.length} audio assets.`);
