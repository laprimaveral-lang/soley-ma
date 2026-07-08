from PIL import Image

def make_white_transparent_precise(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Check if pixel is very close to white
            if r > 200 and g > 200 and b > 200:
                # Make fully transparent
                pixels[x, y] = (r, g, b, 0)

    img.save(output_path, "PNG")
    print("Done: background removed.")

make_white_transparent_precise("../public/logo.png", "../public/logo.png")
