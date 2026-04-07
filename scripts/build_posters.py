#!/usr/bin/env python3

import io
import html
import json
import re
import subprocess
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlparse

import requests
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
POSTER_ROOT = ROOT / "museum" / "posters"
THUMB_ROOT = POSTER_ROOT / "thumbs"
HERO_ROOT = POSTER_ROOT / "hero"
MANIFEST_PATH = ROOT / "museum" / "shared" / "posters.js"

THUMB_SIZE = (480, 480)
HERO_SIZE = (1280, 960)
THUMB_WIDTH, THUMB_HEIGHT = THUMB_SIZE
HERO_WIDTH, HERO_HEIGHT = HERO_SIZE


SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (Codex poster builder)"})
HTML_CACHE: Dict[str, str] = {}
JSON_CACHE: Dict[str, Any] = {}

DIRECT_IMAGE_RE = re.compile(r"\.(?:png|jpe?g|webp|avif)(?:$|\?)", re.I)
SMITHSONIAN_RE = re.compile(r"https://3d-api\.si\.edu/content/document/([^/]+)/", re.I)
MET_RE = re.compile(r"metmuseum\.org/art/collection/search/(\d+)", re.I)


def load_visible_catalog() -> Dict[str, Any]:
    script = """
import * as base from "./museum/shared/catalog.js";
import * as overlay from "./museum/shared/catalog-overlay.js";
const pieces = { ...base.museumPieces, ...overlay.museumPiecesExtension };
const visible = Object.fromEntries(
  Object.entries(pieces).filter(([, piece]) => piece && !piece.hiddenFromLobby)
);
const featured = Array.isArray(base.museumLobby?.featuredPieceIds) ? base.museumLobby.featuredPieceIds : [];
console.log(JSON.stringify({ visible, featured }));
"""
    result = subprocess.check_output(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
    )
    return json.loads(result)


def flatten_urls(piece: Dict[str, Any]) -> List[str]:
    urls: List[str] = []
    source_links = piece.get("source", {}).get("links", [])
    for link in source_links:
        if isinstance(link, dict) and link.get("url"):
            urls.append(link["url"])

    model = piece.get("model", {})
    for key in ("primaryUrl", "fallbackUrl", "url"):
        value = model.get(key)
        if isinstance(value, list):
            urls.extend(str(item) for item in value if item)
        elif value:
            urls.append(str(value))

    return [url for url in urls if url and not str(url).startswith("./")]


def fetch_text(url: str) -> str:
    if url in HTML_CACHE:
        return HTML_CACHE[url]
    try:
        response = SESSION.get(url, timeout=20)
        response.raise_for_status()
        HTML_CACHE[url] = response.text
    except Exception:
        HTML_CACHE[url] = ""
    return HTML_CACHE[url]


def fetch_json(url: str) -> Any:
    if url in JSON_CACHE:
        return JSON_CACHE[url]
    try:
        response = SESSION.get(url, timeout=20)
        response.raise_for_status()
        JSON_CACHE[url] = response.json()
    except Exception:
        JSON_CACHE[url] = {}
    return JSON_CACHE[url]


def extract_og_image(url: str) -> str:
    html = fetch_text(url)
    for pattern in (
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)',
    ):
        match = re.search(pattern, html, re.I)
        if match:
            return match.group(1)
    return ""


def extract_smithsonian_image(url: str) -> str:
    html_text = fetch_text(url)
    match = re.search(r'ids\.si\.edu/ids/deliveryService\?id=[^"\']+', html_text, re.I)
    if match:
        candidate = html.unescape(match.group(0))
        if candidate.startswith("//"):
            candidate = f"https:{candidate}"
        elif candidate.startswith("ids.si.edu/"):
            candidate = f"https://{candidate}"
        if "max=" in candidate:
            candidate = re.sub(r"([?&]max=)\d+", r"\g<1>1200", candidate)
        else:
            separator = "&" if "?" in candidate else "?"
            candidate = f"{candidate}{separator}max=1200"
        return candidate
    return ""


def resolve_source_image(piece_id: str, piece: Dict[str, Any]) -> Optional[str]:
    urls = flatten_urls(piece)

    for url in urls:
        if DIRECT_IMAGE_RE.search(url):
            return url

    for url in urls:
        match = SMITHSONIAN_RE.search(url)
        if match:
            image = extract_smithsonian_image(url)
            if image:
                return image
            return f"https://3d-api.si.edu/content/document/{match.group(1)}/scene-image-thumb.jpg"

    for url in urls:
        if "open.smk.dk" in url:
            image = extract_og_image(url)
            if image:
                return re.sub(r"!\d+,", "!1200,", image)

    for url in urls:
        match = MET_RE.search(url)
        if not match:
            continue
        object_id = match.group(1)
        api_data = fetch_json(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}")
        if isinstance(api_data, dict):
            if api_data.get("primaryImageSmall"):
                return api_data["primaryImageSmall"]
            if api_data.get("primaryImage"):
                return api_data["primaryImage"]
        image = extract_og_image(url)
        if image:
            return image

    for url in urls:
        if any(
            host in url
            for host in (
                "commons.wikimedia.org",
                "upload.wikimedia.org",
                "archive.org",
                "sketchfab.com",
                "galleriaaccademiafirenze.it",
                "collections.louvre.fr",
                "archcalc.cnr.it",
                "britishmuseum.org",
                "clevelandart.org",
                "artsmia.org",
                "muzea.malopolska.pl",
            )
        ):
            image = extract_og_image(url)
            if image:
                return image

    return None


def open_remote_image(url: str) -> Optional[Image.Image]:
    try:
        response = SESSION.get(url, timeout=30)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content))
        return image.convert("RGB")
    except Exception:
        return None


def fit_cover(image: Image.Image, size: Tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    src_w, src_h = image.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h if src_h else 1

    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = max(0, (src_w - new_w) // 2)
        box = (left, 0, left + new_w, src_h)
    else:
        new_h = int(src_w / target_ratio)
        top = max(0, (src_h - new_h) // 2)
        box = (0, top, src_w, top + new_h)

    cropped = image.crop(box)
    return cropped.resize(size, Image.Resampling.LANCZOS)


def load_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size=size)
            except Exception:
                continue
    return ImageFont.load_default()


TITLE_FONT = load_font(34)
SUB_FONT = load_font(18)


def wrap_lines(text: str, max_chars: int) -> List[str]:
    words = text.split()
    lines: List[str] = []
    current = ""
    for word in words:
        proposal = f"{current} {word}".strip()
        if len(proposal) <= max_chars or not current:
            current = proposal
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:4]


def build_placeholder(piece_id: str, piece: Dict[str, Any], size: Tuple[int, int]) -> Image.Image:
    image = Image.new("RGB", size, "#121118")
    draw = ImageDraw.Draw(image)
    width, height = size

    for y in range(height):
        ratio = y / max(1, height - 1)
        top = (18, 22, 31)
        bottom = (10, 12, 18)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * ratio) for i in range(3))
        draw.line([(0, y), (width, y)], fill=color)

    draw.ellipse(
        [width * 0.12, height * 0.1, width * 0.52, height * 0.5],
        fill=(44, 38, 54),
        outline=None,
    )
    draw.rectangle(
        [width * 0.16, height * 0.76, width * 0.84, height * 0.84],
        fill=(240, 192, 164),
    )

    title = piece.get("viewerTitle") or piece_id.replace("-", " ").title()
    title = re.sub(r"\s*\([^)]*\)\s*$", "", title).strip()
    lines = wrap_lines(title, 18 if width < 700 else 22)
    subtitle = piece.get("subtitle", "").replace("Artist: ", "").split(";")[0].strip()

    text_y = height * 0.15
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=TITLE_FONT)
        draw.text(
            ((width - (bbox[2] - bbox[0])) / 2, text_y),
            line,
            font=TITLE_FONT,
            fill=(247, 241, 238),
        )
        text_y += (bbox[3] - bbox[1]) + 8

    if subtitle:
        bbox = draw.textbbox((0, 0), subtitle, font=SUB_FONT)
        draw.text(
            ((width - (bbox[2] - bbox[0])) / 2, min(height - 54, text_y + 18)),
            subtitle,
            font=SUB_FONT,
            fill=(211, 188, 199),
        )

    return image


def save_webp(image: Image.Image, path: Path, quality: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "WEBP", quality=quality, method=6)


def relative_url(path: Path) -> str:
    return "/" + path.relative_to(ROOT).as_posix()


def build_assets() -> Dict[str, Dict[str, Any]]:
    catalog = load_visible_catalog()
    visible = catalog["visible"]
    featured_ids = set(catalog.get("featured", []))
    manifest: Dict[str, Dict[str, Any]] = {}

    for piece_id, piece in visible.items():
        source_url = resolve_source_image(piece_id, piece)
        source_image = open_remote_image(source_url) if source_url else None

        thumb_image = fit_cover(source_image, THUMB_SIZE) if source_image else build_placeholder(piece_id, piece, THUMB_SIZE)
        thumb_path = THUMB_ROOT / f"{piece_id}.webp"
        save_webp(thumb_image, thumb_path, quality=76)

        hero_url = None
        if piece_id in featured_ids:
            hero_image = fit_cover(source_image, HERO_SIZE) if source_image else build_placeholder(piece_id, piece, HERO_SIZE)
            hero_path = HERO_ROOT / f"{piece_id}.webp"
            save_webp(hero_image, hero_path, quality=80)
            hero_url = relative_url(hero_path)

        manifest[piece_id] = {
            "thumb": relative_url(thumb_path),
            "thumbWidth": THUMB_WIDTH,
            "thumbHeight": THUMB_HEIGHT,
            "hero": hero_url,
            "heroWidth": HERO_WIDTH if hero_url else THUMB_WIDTH,
            "heroHeight": HERO_HEIGHT if hero_url else THUMB_HEIGHT,
            "sourceImage": source_url or "",
        }

    return manifest


def write_manifest(manifest: Dict[str, Dict[str, Any]]) -> None:
    content = (
        "export const POSTER_MANIFEST = "
        + json.dumps(manifest, indent=2, sort_keys=True)
        + ";\n\n"
        + """export function posterForPiece(pieceId) {
  return POSTER_MANIFEST[pieceId] || null;
}
"""
    )
    MANIFEST_PATH.write_text(content)


def main() -> None:
    THUMB_ROOT.mkdir(parents=True, exist_ok=True)
    HERO_ROOT.mkdir(parents=True, exist_ok=True)
    manifest = build_assets()
    write_manifest(manifest)
    print(f"Built {len(manifest)} poster entries.")


if __name__ == "__main__":
    main()
