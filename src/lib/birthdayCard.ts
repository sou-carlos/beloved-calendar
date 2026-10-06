import { birthdayLabel } from "./dates";

export interface BirthdayCardContent {
  name: string;
  birthDate: string;
  message: string;
  sender: string;
}

// Split by measured width, including long words, without cutting Unicode characters.
export function cardLines(context: Pick<CanvasRenderingContext2D, "measureText">, text: string, width: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, "\n").trim().split("\n")) {
    let line = "";
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const candidate = line ? line + " " + word : word;
      if (context.measureText(candidate).width <= width) { line = candidate; continue; }
      if (line) { lines.push(line); line = ""; }
      for (const character of Array.from(word)) {
        if (line && context.measureText(line + character).width > width) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function renderBirthdayCard(content: BirthdayCardContent): Promise<HTMLCanvasElement> {
  if (!content.message.trim() || !content.sender.trim())
    throw new Error("Preencha a mensagem e o remetente para preparar sua carta.");
  if (content.message.length > 600 || content.sender.length > 80)
    throw new Error("Use até 600 caracteres na mensagem e 80 no remetente.");
  await Promise.all([
    document.fonts.load('600 64px "Pixelify Sans"'),
    document.fonts.load('400 32px "Nunito"'),
  ]);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem neste navegador.");
  const width = 768;
  context.font = '600 64px "Pixelify Sans", monospace';
  const names = cardLines(context, content.name, width);
  context.font = '400 32px "Nunito", sans-serif';
  const message = cardLines(context, content.message, width);
  if (message.length > 24)
    throw new Error("Sua mensagem tem muitas linhas. Use até 24 linhas para caber na carta.");
  context.font = '600 44px "Pixelify Sans", monospace';
  const sender = cardLines(context, content.sender, width - 120);
  const messageY = 420 + names.length * 76;
  const senderY = messageY + message.length * 48 + 100;
  canvas.width = 1080;
  canvas.height = Math.max(1440, senderY + sender.length * 56 + 240);
  const height = canvas.height;
  context.imageSmoothingEnabled = false;
  function rect(x: number, y: number, w: number, h: number, color: string) {
    context!.fillStyle = color;
    context!.fillRect(x, y, w, h);
  }
  function sprite(pattern: string[], x: number, y: number, scale: number, palette: Record<string, string>) {
    pattern.forEach((row, dy) => Array.from(row).forEach((pixel, dx) => {
      if (palette[pixel]) rect(x + dx * scale, y + dy * scale, scale, scale, palette[pixel]);
    }));
  }
  const heart = [".rr..rr.", "rrrrrrrr", "rrrrrrrr", ".rrrrrr.", "..rrrr..", "...rr..."];
  const flower = ["...yy...", "..yyyy..", ".yywwyy.", "..yyyy..", "...gg...", ".g.gg.g.", "..gggg..", "...gg..."];
  const colors = { r: "#ce6859", y: "#f9c86a", w: "#fff0bd", g: "#527143" };
  // Original pixel-art stationery: wood frame, parchment, flowers and a wax seal.
  rect(0, 0, 1080, height, "#567965");
  rect(24, 24, 1032, height - 48, "#683e29");
  rect(36, 36, 1008, height - 72, "#ac7040");
  for (let y = 48; y < height - 36; y += 48) {
    rect(36, y, 1008, 4, "#975d35");
    rect(52 + (y % 3) * 16, y + 16, 52, 4, "#c28b51");
  }
  rect(60, 60, 960, height - 120, "#7c4c2e");
  rect(72, 72, 936, height - 144, "#d7a76a");
  rect(84, 96, 912, height - 192, "#f5db9e");
  rect(96, 84, 888, height - 168, "#f5db9e");
  rect(108, 108, 864, height - 216, "#ffedbe");
  rect(120, 120, 840, 8, "#fff5d4");
  rect(120, height - 136, 840, 8, "#dfb978");
  // Subtle deterministic flecks keep the exported paper identical to the preview.
  for (let i = 0; i < 120; i++) {
    const x = 124 + ((i * 137) % 828);
    const y = 144 + ((i * 211) % (height - 300));
    rect(x, y, 3, 3, "#ecd49e");
  }
  sprite(flower, 132, 152, 7, colors);
  sprite(flower, 892, 152, 7, colors);
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillStyle = "#70432c";
  context.font = '400 24px "Pixelify Sans", monospace';
  context.fillText("UMA CARTA PARA CELEBRAR VOCÊ", 540, 174);
  context.font = '600 70px "Pixelify Sans", monospace';
  context.fillText("Feliz aniversário!", 540, 248);
  context.font = '600 64px "Pixelify Sans", monospace';
  names.forEach((line, i) => context.fillText(line, 540, 336 + i * 76));
  context.fillStyle = "#91613c";
  context.font = '400 30px "Nunito", sans-serif';
  context.fillText(birthdayLabel(content.birthDate), 540, 350 + names.length * 76);
  rect(156, messageY - 34, 768, 3, "#d8b273");
  context.textAlign = "left";
  context.fillStyle = "#563b2c";
  context.font = '400 32px "Nunito", sans-serif';
  message.forEach((line, i) => context.fillText(line, 156, messageY + i * 48));
  context.font = '400 28px "Nunito", sans-serif';
  context.fillText("Com carinho,", 156, senderY - 48);
  context.font = '600 44px "Pixelify Sans", monospace';
  sender.forEach((line, i) => context.fillText(line, 156, senderY + i * 56));
  const sealY = height - 268;
  rect(856, sealY, 60, 84, "#a64e3c");
  rect(844, sealY + 12, 84, 60, "#a64e3c");
  rect(852, sealY + 16, 68, 48, "#d07a59");
  sprite(heart, 862, sealY + 24, 6, { r: "#ffdc9b" });
  sprite(flower, 132, height - 208, 6, colors);
  sprite(flower, 900, height - 208, 6, colors);
  context.textAlign = "center";
  context.fillStyle = "#91613c";
  context.font = '400 24px "Pixelify Sans", monospace';
  context.fillText("Que seu novo ciclo floresça!", 540, height - 184);
  return canvas;
}

export function birthdayCardFilename(name: string): string {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return "parabens-" + (slug || "aniversario") + ".png";
}
