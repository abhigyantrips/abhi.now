#!/usr/bin/env python3
"""Capture or compare Now's static output using only Python's standard library.

Capture: python3 scripts/site-coverage.py capture apps/now/dist/client docs/new-coverage.json
Compare: python3 scripts/site-coverage.py compare apps/now/dist/client docs/now-coverage.json
Run a production build first. Embed pages are recorded but excluded from comparison.
"""

import argparse
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
import xml.etree.ElementTree as ET


class PageMetadata(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.canonicals = []
        self.robots = []
        self.feeds = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        rel = attrs.get("rel", "").split()
        if tag == "link" and "canonical" in rel:
            self.canonicals.append(attrs.get("href"))
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.robots.append(attrs.get("content"))
        if tag == "link" and attrs.get("type") in ("application/rss+xml", "application/atom+xml"):
            self.feeds.append(attrs)


def xml_tree(node):
    # Compare parsed XML, preserving item order, text, URLs, and all metadata.
    # Namespace prefixes and XML attribute order do not affect equality.
    return [node.tag, sorted(node.attrib.items()), node.text or "",
            [[xml_tree(child), child.tail or ""] for child in node]]


def snapshot(directory):
    if not (directory / "index.html").is_file():
        raise ValueError(f"No built homepage in {directory}; build Now first")
    pages, embeds, xml = {}, [], {}
    for file in sorted(directory.rglob("*.html")):
        relative = file.relative_to(directory).as_posix()
        route = "/" + relative.removesuffix("index.html") if file.name == "index.html" else "/" + relative
        if route.rstrip("/").endswith("/embed"):
            embeds.append(route)
            continue
        metadata = PageMetadata(file.read_text())
        pages[route] = {"canonical": metadata.canonicals, "robots": metadata.robots,
                        "feed_links": metadata.feeds}
    for file in sorted(directory.rglob("*.xml")):
        root = ET.parse(file).getroot()
        parsed = json.dumps(xml_tree(root), ensure_ascii=False, separators=(",", ":"))
        entry = {"sha256": hashlib.sha256(parsed.encode()).hexdigest()}
        if root.tag == "rss":
            entry["items"] = [{"link": item.findtext("link"), "guid": item.findtext("guid"),
                                "title": item.findtext("title"), "pubDate": item.findtext("pubDate")}
                               for item in root.findall("./channel/item")]
        else:
            entry["locations"] = [node.text for node in root.iter()
                                  if node.tag.rsplit("}", 1)[-1] == "loc"]
        xml["/" + file.relative_to(directory).as_posix()] = entry
    if not xml or "/sitemap-index.xml" not in xml:
        raise ValueError("Missing XML/sitemap output; build Now first")
    return {"pages": pages, "xml": xml, "retiring_embed_pages": embeds}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["capture", "compare"])
    parser.add_argument("output_directory", type=Path)
    parser.add_argument("baseline", type=Path)
    args = parser.parse_args()
    current = snapshot(args.output_directory)
    if args.action == "capture":
        current["source_commit"] = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], text=True).strip()
        current["source_status"] = subprocess.check_output(
            ["git", "status", "--porcelain", "--untracked-files=no"], text=True).strip()
        args.baseline.parent.mkdir(parents=True, exist_ok=True)
        args.baseline.write_text(json.dumps(current, indent=2, ensure_ascii=False) + "\n")
        print(f"Captured {len(current['pages'])} pages, {len(current['xml'])} XML endpoints, "
              f"and {len(current['retiring_embed_pages'])} retiring embed pages.")
        return
    baseline = json.loads(args.baseline.read_text())
    differences = []
    for section in ("pages", "xml"):
        old, new = baseline[section], current[section]
        differences.extend(f"Removed {section}: {path}" for path in sorted(old.keys() - new.keys()))
        differences.extend(f"Added {section}: {path}" for path in sorted(new.keys() - old.keys()))
        differences.extend(f"Changed {section}: {path}" for path in sorted(old.keys() & new.keys())
                           if old[path] != new[path])
    if differences:
        print("\n".join(differences))
        sys.exit(1)
    print("Page paths, canonical/robots/feed metadata, and XML contents match the baseline.")
    print("Embed pages are excluded from comparison; assets, page bodies, and hosting behavior need separate checks.")


if __name__ == "__main__":
    main()
