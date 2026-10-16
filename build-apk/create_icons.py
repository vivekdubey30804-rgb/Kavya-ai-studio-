import zlib
import struct
import math

def make_png(width, height, get_pixel):
    # RGBA
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data), 9)
    
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)

    header = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    return png

def pixel_kavya(x, y, w, h):
    # Normalized coords from -1 to 1
    nx = (x - w / 2) / (w / 2)
    ny = (y - h / 2) / (h / 2)
    dist = math.sqrt(nx * nx + ny * ny)

    # Rounded rect background (radius ~ 0.28)
    corner_limit = 0.75
    dx = max(0, abs(nx) - corner_limit)
    dy = max(0, abs(ny) - corner_limit)
    corner_dist = math.sqrt(dx * dx + dy * dy)
    if corner_dist > 0.25:
        return 0, 0, 0, 0 # Transparent

    # Background gradient: deep violet (#1e112a) to dark magenta (#2d123c)
    t = (nx + ny + 2) / 4.0
    bg_r = int(30 * (1 - t) + 45 * t)
    bg_g = int(17 * (1 - t) + 18 * t)
    bg_b = int(42 * (1 - t) + 60 * t)

    # Central glowing circle (heart/avatar badge)
    # Circle center at (0, -0.1) radius 0.45
    cx, cy = 0.0, -0.05
    cdist = math.sqrt((nx - cx)**2 + (ny - cy)**2)

    if cdist < 0.42:
        # Radial glow from pink (#ec4899) to purple (#8b5cf6)
        gt = cdist / 0.42
        r = int(236 * (1 - gt) + 139 * gt)
        g = int(72 * (1 - gt) + 92 * gt)
        b = int(153 * (1 - gt) + 246 * gt)

        # Heart shape in center
        # Heart equation in normalized local coords
        hx = (nx - cx) * 2.8
        hy = -(ny - cy + 0.05) * 2.8
        # (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
        val = (hx*hx + hy*hy - 1.0)**3 - (hx*hx) * (hy*hy*hy)
        if val <= 0:
            return 255, 255, 255, 255 # White heart
        return r, g, b, 255

    # Outer border ring
    if 0.92 < max(abs(nx), abs(ny)) < 0.98 and corner_dist <= 0.25:
        return 236, 72, 153, 180

    return bg_r, bg_g, bg_b, 255

sizes = [
    ('/build-apk/res/mipmap-mdpi/ic_launcher.png', 48),
    ('/build-apk/res/mipmap-hdpi/ic_launcher.png', 72),
    ('/build-apk/res/mipmap-xhdpi/ic_launcher.png', 96),
    ('/build-apk/res/mipmap-xxhdpi/ic_launcher.png', 144),
    ('/build-apk/res/mipmap-xxxhdpi/ic_launcher.png', 192),
    ('/app/applet/public/icon-192.png', 192),
    ('/app/applet/public/icon-512.png', 512),
]

for path, size in sizes:
    data = make_png(size, size, pixel_kavya)
    with open(path, 'wb') as f:
        f.write(data)
    print(f"Generated {path} ({size}x{size})")

print("All icons successfully generated!")
