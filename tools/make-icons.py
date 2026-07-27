#!/usr/bin/env python3
"""Genera los iconos PWA de FILO sin dependencias (PNG a mano con zlib).

El icono es el propio personaje: un cuadrado dorado de esquinas redondeadas
con dos ojos, sobre el fondo del juego. Se usa el mismo dibujo en los tres
tamaños; el maskable deja el 20% de margen que exige Android.

Uso:  python3 tools/make-icons.py
"""
import struct, zlib, os

BG    = (0x0a, 0x0d, 0x16)
BG2   = (0x16, 0x1f, 0x38)
GOLD  = (0xff, 0xd1, 0x66)
DARK  = (0x20, 0x18, 0x0a)

def png(path, w, h, pixels):
    raw = b''.join(b'\x00' + bytes(v for px in pixels[y] for v in px) for y in range(h))
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    out = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(raw, 9))
           + chunk(b'IEND', b''))
    open(path, 'wb').write(out)
    print(path, w, 'x', h, os.path.getsize(path), 'bytes')

def rounded(px, py, x0, y0, x1, y1, r):
    """¿El punto está dentro del rectángulo de esquinas redondeadas?"""
    if not (x0 <= px <= x1 and y0 <= py <= y1):
        return False
    cx = min(max(px, x0 + r), x1 - r)
    cy = min(max(py, y0 + r), y1 - r)
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r

def draw(size, inset):
    """inset = margen libre alrededor del personaje (0..0.5)."""
    img = []
    m = size * inset
    # cuerpo del personaje
    bx0, by0 = m, m * 1.05
    bx1, by1 = size - m, size - m * .95
    br = (bx1 - bx0) * .22
    eye = (bx1 - bx0) * .13
    ey = by0 + (by1 - by0) * .34
    ex1 = bx0 + (bx1 - bx0) * .34
    ex2 = bx0 + (bx1 - bx0) * .62
    for y in range(size):
        row = []
        for x in range(size):
            # fondo con degradé vertical suave
            t = y / (size - 1)
            col = tuple(int(BG2[i] + (BG[i] - BG2[i]) * t) for i in range(3))
            if rounded(x, y, bx0, by0, bx1, by1, br):
                col = GOLD
                for ex in (ex1, ex2):
                    if abs(x - ex) <= eye * .55 and abs(y - ey) <= eye * .8:
                        col = DARK
            row.append(col)
        img.append(row)
    return img

if __name__ == '__main__':
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    png(os.path.join(here, 'icon-192.png'), 192, 192, draw(192, .22))
    png(os.path.join(here, 'icon-512.png'), 512, 512, draw(512, .22))
    png(os.path.join(here, 'icon-maskable.png'), 512, 512, draw(512, .30))
