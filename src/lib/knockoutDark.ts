/** Punch out generator plates (white/gray or solid black) so art floats on the reef. */
function isLightPlate(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  const avg = (r + g + b) / 3;
  if (sat < 34 && avg > 158) return true;
  if (r + g + b > 700) return true;
  return false;
}

function isNearBlack(r: number, g: number, b: number) {
  return r < 22 && g < 22 && b < 22;
}

function isColorful(r: number, g: number, b: number) {
  return !isNearBlack(r, g, b) && !isLightPlate(r, g, b);
}

function floodPlate(
  d: Uint8ClampedArray,
  w: number,
  h: number,
  isPlate: (r: number, g: number, b: number) => boolean,
  protectOutline: boolean,
) {
  const seen = new Uint8Array(w * h);
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);
  let qh = 0;
  let qt = 0;

  const colorfulNear = (x: number, y: number) => {
    for (let ny = Math.max(0, y - 1); ny <= Math.min(h - 1, y + 1); ny++) {
      for (let nx = Math.max(0, x - 1); nx <= Math.min(w - 1, x + 1); nx++) {
        if (nx === x && ny === y) continue;
        const i = (ny * w + nx) * 4;
        if ((d[i + 3] ?? 0) < 12) continue;
        if (isColorful(d[i]!, d[i + 1]!, d[i + 2]!)) return true;
      }
    }
    return false;
  };

  const trySeed = (x: number, y: number) => {
    const idx = y * w + x;
    if (seen[idx]) return;
    const i = idx * 4;
    if ((d[i + 3] ?? 0) < 12) {
      seen[idx] = 1;
      return;
    }
    const r = d[i]!;
    const g = d[i + 1]!;
    const b = d[i + 2]!;
    if (!isPlate(r, g, b)) return;
    if (protectOutline && colorfulNear(x, y)) {
      seen[idx] = 1;
      return;
    }
    seen[idx] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  };

  for (let x = 0; x < w; x++) {
    trySeed(x, 0);
    trySeed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y);
    trySeed(w - 1, y);
  }

  const dirs = [1, 0, -1, 0, 0, 1, 0, -1];
  while (qh < qt) {
    const x = qx[qh]!;
    const y = qy[qh]!;
    qh++;
    const i = (y * w + x) * 4;
    d[i + 3] = 0;
    for (let k = 0; k < 8; k += 2) {
      const nx = x + dirs[k]!;
      const ny = y + dirs[k + 1]!;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      trySeed(nx, ny);
    }
  }
}

export function knockoutDarkBackground(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const frame = ctx.getImageData(0, 0, w, h);
        floodPlate(frame.data, w, h, isLightPlate, false);
        floodPlate(frame.data, w, h, isNearBlack, true);
        ctx.putImageData(frame, 0, 0);
        resolve(cropToSquare(canvas, frame));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => reject(new Error("image failed"));
    img.src = src;
  });
}

/** Tight-crop the subject, then letterbox it in a square so every fish fills the same. */
function cropToSquare(source: HTMLCanvasElement, frame: ImageData) {
  const w = source.width;
  const h = source.height;
  const d = frame.data;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = d[(y * w + x) * 4 + 3] ?? 0;
      if (a < 48) continue;
      let neighbors = 0;
      for (let ny = Math.max(0, y - 1); ny <= Math.min(h - 1, y + 1); ny++) {
        for (let nx = Math.max(0, x - 1); nx <= Math.min(w - 1, x + 1); nx++) {
          if ((d[(ny * w + nx) * 4 + 3] ?? 0) >= 48) neighbors++;
        }
      }
      if (neighbors < 4) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return source.toDataURL("image/png");

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const side = Math.max(bw, bh);
  const pad = Math.max(8, Math.round(side * 0.08));
  const out = side + pad * 2;
  const dest = document.createElement("canvas");
  dest.width = out;
  dest.height = out;
  const ctx = dest.getContext("2d");
  if (!ctx) return source.toDataURL("image/png");
  ctx.drawImage(
    source,
    minX,
    minY,
    bw,
    bh,
    pad + Math.round((side - bw) / 2),
    pad + Math.round((side - bh) / 2),
    bw,
    bh,
  );
  return dest.toDataURL("image/png");
}
