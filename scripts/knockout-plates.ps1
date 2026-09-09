$src = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public static class PlateKnockout {
  static bool IsKidPlate(byte r, byte g, byte b) {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    int sat = max - min;
    int sum = r + g + b;
    return (sat < 30 && min > 175) || sum > 700;
  }

  static bool IsMapPlate(byte r, byte g, byte b) {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    int sat = max - min;
    int sum = r + g + b;
    bool greenLand = (g > r + 18) && (g > b + 18);
    if (greenLand) return false;
    if (max < 70) return false;
    if (sat < 34 && min > 148) return true;
    if (sat < 48 && min > 205) return true;
    if (sum > 690) return true;
    return false;
  }

  public static void Process(string path, string mode) {
    using (var src = new Bitmap(path)) {
      int w = src.Width, h = src.Height;
      var rect = new Rectangle(0, 0, w, h);
      var srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      byte[] pixels = new byte[Math.Abs(srcData.Stride) * h];
      System.Runtime.InteropServices.Marshal.Copy(srcData.Scan0, pixels, 0, pixels.Length);
      int stride = srcData.Stride;
      src.UnlockBits(srcData);

      bool[,] clear = new bool[w, h];
      Func<int,int,byte,byte,byte> get = (x, y, c) => {
        int i = y * stride + x * 4;
        if (c == 0) return pixels[i];
        if (c == 1) return pixels[i + 1];
        return pixels[i + 2];
      };

      if (mode == "flood") {
        var q = new Queue<int>();
        Action<int,int> trySeed = (x, y) => {
          byte b = get(x,y,0), g = get(x,y,1), r = get(x,y,2);
          if (!clear[x,y] && IsKidPlate(r,g,b)) { clear[x,y] = true; q.Enqueue(x << 16 | y); }
        };
        for (int x = 0; x < w; x++) { trySeed(x, 0); trySeed(x, h - 1); }
        for (int y = 0; y < h; y++) { trySeed(0, y); trySeed(w - 1, y); }
        int[] dx = {1,-1,0,0};
        int[] dy = {0,0,1,-1};
        while (q.Count > 0) {
          int p = q.Dequeue();
          int x = p >> 16, y = p & 0xFFFF;
          for (int k = 0; k < 4; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h || clear[nx,ny]) continue;
            byte b = get(nx,ny,0), g = get(nx,ny,1), r = get(nx,ny,2);
            if (IsKidPlate(r,g,b)) { clear[nx,ny] = true; q.Enqueue(nx << 16 | ny); }
          }
        }
        for (int y = 0; y < h; y++) {
          for (int x = 0; x < w; x++) {
            if (clear[x,y]) pixels[y * stride + x * 4 + 3] = 0;
          }
        }
      } else {
        for (int y = 0; y < h; y++) {
          for (int x = 0; x < w; x++) {
            int i = y * stride + x * 4;
            if (IsMapPlate(pixels[i+2], pixels[i+1], pixels[i])) pixels[i+3] = 0;
          }
        }
      }

      using (var dst = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
        var dstData = dst.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        System.Runtime.InteropServices.Marshal.Copy(pixels, 0, dstData.Scan0, pixels.Length);
        dst.UnlockBits(dstData);
        string tmp = path + ".tmp.png";
        dst.Save(tmp, ImageFormat.Png);
        dst.Dispose();
        System.IO.File.Delete(path);
        System.IO.File.Move(tmp, path);
      }
    }
  }
}
'@

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition $src

[PlateKnockout]::Process("e:\MyProjects\ocean-wonders-v3\src\assets\kid-diver-boy.png", "flood")
Write-Output "boy ok"
[PlateKnockout]::Process("e:\MyProjects\ocean-wonders-v3\src\assets\kid-diver-girl.png", "flood")
Write-Output "girl ok"
[PlateKnockout]::Process("e:\MyProjects\ocean-wonders-v3\src\assets\cartoon-continents-clean.png", "map")
Write-Output "map ok"
