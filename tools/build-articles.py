#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the ten August-2026 blog articles for breakoutmusic.io.

Source of truth: breakoutmusic-blog-articles-2026-08.md (plan + full texts).
Template: live-snapshot/article-spotify-algorithm-2026.html (site chrome,
author box, sidebar). The per-article "Анкори та лінки" table from the MD is
a working list only and is never rendered.

Run from the repo root:  python3 tools/build-articles.py
"""
import re, html, math, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD = "/Users/yanahryshkina/Music Club/breakoutmusic-blog-articles-2026-08.md"
SNAP = os.path.join(ROOT, "live-snapshot")
TEMPLATE = os.path.join(SNAP, "article-spotify-algorithm-2026.html")
PUB_DATE = "2026-08-24"
PUB_HUMAN = "August 24, 2026"
OG_IMAGE = "https://breakoutmusic.io/assets/favicon-512.png"

# slug -> (short breadcrumb name, category, card emoji, card gradient)
META = {
    "article-spotify-promotion-services-2026": ("Spotify Promotion Services", "Spotify Growth", "\U0001F4B0", "linear-gradient(135deg,#0d3b2a,#00FF85 220%)"),
    "article-how-to-get-on-spotify-playlists": ("How to Get on Playlists", "Spotify Growth", "\U0001F4CB", "linear-gradient(135deg,#0e2f3d,#1DB954 240%)"),
    "article-spotify-editorial-playlists": ("Editorial Playlists", "Spotify Growth", "\U0001F3AF", "linear-gradient(135deg,#15303b,#00FF85 260%)"),
    "article-increase-spotify-monthly-listeners": ("Monthly Listeners", "Spotify Growth", "\U0001F4C8", "linear-gradient(135deg,#12333f,#0fd67f 250%)"),
    "article-is-buying-spotify-plays-safe": ("Is Buying Plays Safe?", "Spotify Growth", "\U0001F6E1️", "linear-gradient(135deg,#232b16,#00FF85 260%)"),
    "article-promote-music-on-soundcloud-2026": ("SoundCloud Promotion", "SoundCloud Growth", "\U0001F50A", "linear-gradient(135deg,#3d2113,#FF5500 240%)"),
    "article-soundcloud-reposts-explained": ("SoundCloud Reposts", "SoundCloud Growth", "\U0001F501", "linear-gradient(135deg,#39180d,#FF5500 260%)"),
    "article-playlist-pitching-vs-paid-placement": ("Pitching vs Paid Placement", "Spotify Growth", "⚖️", "linear-gradient(135deg,#1a2f30,#00FF85 240%)"),
    "article-spotify-saves-vs-streams": ("Saves vs Streams", "Spotify Growth", "\U0001F4BE", "linear-gradient(135deg,#112d3a,#1DB954 260%)"),
    "article-spotify-release-week-checklist": ("Release Week Checklist", "Spotify Growth", "✅", "linear-gradient(135deg,#0f3527,#00FF85 230%)"),
}

# ---------------------------------------------------------------- parse plan
src = open(MD, encoding="utf-8").read()

status_rows = re.findall(r"^\| (\d+) \| (.+?) \| .+? \| `/(article-[a-z0-9-]+)` \|", src, re.M)
plan = {}  # num -> dict
for num, title, slug in status_rows:
    plan[int(num)] = {"title": title.strip(), "slug": slug}

# meta title/description from each "## N. ..." plan block
for m in re.finditer(r"^## (\d+)\. .+?$([\s\S]*?)(?=^---$)", src, re.M):
    num = int(m.group(1))
    if num not in plan:
        continue
    block = m.group(2)
    mt = re.search(r"\*\*Meta title:\*\*\s*(.+)", block)
    md_ = re.search(r"\*\*Meta description:\*\*\s*(.+)", block)
    if mt:
        plan[num]["meta_title"] = re.sub(r"\s*\(\d+ симв\..*?\)\s*$", "", mt.group(1)).strip()
    if md_:
        plan[num]["meta_desc"] = re.sub(r"\s*\(\d+ симв\..*?\)\s*$", "", md_.group(1)).strip()

# ---------------------------------------------------------------- parse bodies
# Bodies are "# H1" blocks (the file header is line 1, skip it).
body_matches = list(re.finditer(r"^# (?!Breakout Music)(.+)$", src, re.M))
bodies = []
for i, m in enumerate(body_matches):
    start = m.start()
    end = body_matches[i + 1].start() if i + 1 < len(body_matches) else len(src)
    chunk = src[start:end]
    chunk = re.sub(r"\n---\s*(\n## \d+\..*)?$", "", chunk, flags=re.S)
    bodies.append((m.group(1).strip(), chunk))
assert len(bodies) == 10, f"expected 10 article bodies, got {len(bodies)}"

# ---------------------------------------------------------------- md -> html
def slugify(t):
    t = re.sub(r"[^a-z0-9 ]", "", t.lower())
    return "-".join(t.split()[:5]) or "section"

def inline(t):
    t = html.escape(t, quote=False)
    def link(m):
        txt, url = m.group(1), m.group(2)
        if url.startswith("http"):
            return f'<a href="{url}" target="_blank" rel="noopener">{txt}</a>'
        return f'<a href="{url}">{txt}</a>'
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    return t

def render_table(lines):
    rows = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines]
    rows = [r for r in rows if not all(re.fullmatch(r"-{2,}:?|:?-{2,}:?", c) for c in r)]
    head, body_rows = rows[0], rows[1:]
    out = ['<div class="table-scroll"><table>']
    out.append("<thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead>")
    out.append("<tbody>")
    for r in body_rows:
        out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
    out.append("</tbody></table></div>")
    return "\n".join(out)

def convert(body_md, h1):
    """Return (sections_html, toc[(id,title)], faq[(q,a)], wordcount)."""
    lines = body_md.splitlines()[1:]  # drop the H1 line
    blocks, cur = [], []
    for ln in lines:
        if ln.strip() == "":
            if cur:
                blocks.append(cur); cur = []
        else:
            cur.append(ln)
    if cur:
        blocks.append(cur)

    sections, toc, faq = [], [], []
    sec_id, sec_title, sec_html, in_faq = None, None, [], False
    intro_html = []

    def close():
        nonlocal sec_id, sec_html
        if sec_id is not None:
            sections.append((sec_id, sec_title, sec_html))
        sec_id, sec_html = None, []

    for b in blocks:
        first = b[0]
        if first.startswith("## "):
            close()
            sec_title_local = first[3:].strip()
            in_faq = bool(re.match(r"(?i)^(frequently asked|faq)", sec_title_local))
            sec_id = "faq" if in_faq else slugify(sec_title_local)
            # keep ids unique
            existing = [s[0] for s in sections]
            if sec_id in existing:
                sec_id += f"-{len(existing)}"
            sec_title = sec_title_local
            toc.append((sec_id, sec_title_local))
            rest = b[1:]
            if rest:
                b = rest
                first = b[0]
            else:
                continue
        target = sec_html if sec_id is not None else intro_html

        if first.startswith("### "):
            target.append(f"<h3>{inline(first[4:].strip())}</h3>")
            b = b[1:]
            if not b:
                continue
            first = b[0]
        if first.startswith("|"):
            target.append(render_table(b))
        elif re.match(r"^- ", first):
            stripped = [re.sub(r"^- ", "", l) for l in b]
            items = "".join("<li>" + inline(t) + "</li>" for t in stripped)
            target.append(f"<ul>{items}</ul>")
        elif re.match(r"^\d+\. ", first):
            stripped = [re.sub(r"^\d+\. ", "", l) for l in b]
            items = "".join("<li>" + inline(t) + "</li>" for t in stripped)
            target.append(f"<ol>{items}</ol>")
        elif in_faq and first.startswith("**") and first.rstrip().endswith("**"):
            q = first.strip().strip("*").strip()
            a_lines = b[1:]
            a = " ".join(a_lines).strip()
            faq.append((q, a))
            target.append(f"<h3>{html.escape(q, quote=False)}</h3>")
            target.append(f"<p>{inline(a)}</p>")
        else:
            target.append(f"<p>{inline(' '.join(b))}</p>")
    close()

    parts = []
    if intro_html:
        parts.append("<section id=\"intro\">\n" + "\n".join(intro_html) + "\n</section>")
    for sid, st, sh in sections:
        parts.append(f'<section id="{sid}">\n<h2>{inline(st)}</h2>\n' + "\n".join(sh) + "\n</section>")
    words = len(re.findall(r"\w+", body_md))
    return "\n\n".join(parts), toc, faq, words

# ---------------------------------------------------------------- template fill
tpl = open(TEMPLATE, encoding="utf-8").read()

def sub1(pattern, repl, s, flags=0):
    new, n = re.subn(pattern, repl, s, count=1, flags=flags)
    assert n == 1, f"pattern not found: {pattern[:60]}"
    return new

def json_str(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')

generated = []
for num in range(1, 11):
    p = plan[num]
    h1, body_md = bodies[num - 1]
    slug = p["slug"]
    short, category, emoji, grad = META[slug]
    url = f"https://breakoutmusic.io/{slug}"
    body_html, toc, faq, words = convert(body_md, h1)
    read_min = max(3, math.ceil(words / 200))
    first_para = re.search(r"<p>(.*?)</p>", body_html, re.S).group(1)
    excerpt_full = re.sub(r"<[^>]+>", "", first_para)
    # card excerpt: cut at sentence boundary under ~180 chars
    card_excerpt = excerpt_full
    if len(card_excerpt) > 180:
        cut = card_excerpt[:180]
        card_excerpt = cut[: cut.rfind(". ") + 1] if ". " in cut else cut + "…"

    page = tpl
    page = sub1(r"<title>.*?</title>", f"<title>{p['meta_title']} — Breakout</title>", page, re.S)
    page = sub1(r'<meta name="description" content=".*?">', f'<meta name="description" content="{p["meta_desc"]}">', page, re.S)
    page = sub1(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{url}">', page)
    page = sub1(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{p["meta_title"]}">', page, re.S)
    page = sub1(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{p["meta_desc"]}">', page, re.S)
    page = sub1(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{url}">', page)
    page = sub1(r'<meta property="article:published_time" content=".*?">', f'<meta property="article:published_time" content="{PUB_DATE}">', page)
    page = sub1(r'<meta property="article:modified_time" content=".*?">', f'<meta property="article:modified_time" content="{PUB_DATE}">', page)
    page = sub1(r'<meta property="article:section" content=".*?">', f'<meta property="article:section" content="{category}">', page)

    # --- JSON-LD: Article (block 1)
    article_ld = f'''{{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{json_str(h1)}",
    "description": "{json_str(p['meta_desc'])}",
    "image": "{OG_IMAGE}",
    "datePublished": "{PUB_DATE}",
    "dateModified": "{PUB_DATE}",
    "wordCount": {words},
    "author": {{
      "@type": "Person",
      "name": "Daniel Rivera",
      "jobTitle": "Head of Music Strategy",
      "worksFor": {{
        "@type": "Organization",
        "name": "Breakout"
      }},
      "description": "8+ years in music marketing. Former Spotify for Artists advisor. Has managed promotion campaigns for 2,000+ independent artists."
    }},
    "publisher": {{
      "@type": "Organization",
      "name": "Breakout",
      "url": "https://breakoutmusic.io",
      "logo": {{
        "@type": "ImageObject",
        "url": "https://breakoutmusic.io/assets/logo.png"
      }}
    }},
    "mainEntityOfPage": {{
      "@type": "WebPage",
      "@id": "{url}"
    }}
  }}'''
    breadcrumb_ld = f'''{{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://breakoutmusic.io/" }},
      {{ "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://breakoutmusic.io/blog" }},
      {{ "@type": "ListItem", "position": 3, "name": "{json_str(short)}", "item": "{url}" }}
    ]
  }}'''
    ld_blocks = re.findall(r'<script type="application/ld\+json">[\s\S]*?</script>', page)
    assert len(ld_blocks) == 3
    page = page.replace(ld_blocks[0], f'<script type="application/ld+json">\n  {article_ld}\n  </script>')
    page = page.replace(ld_blocks[1], f'<script type="application/ld+json">\n  {breadcrumb_ld}\n  </script>')
    if faq:
        def strip_md_links(t):
            return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
        ents = ",\n      ".join(
            '{ "@type": "Question", "name": "' + json_str(q) + '", "acceptedAnswer": { "@type": "Answer", "text": "' + json_str(strip_md_links(a)) + '" } }'
            for q, a in faq
        )
        faq_ld = f'{{\n    "@context": "https://schema.org",\n    "@type": "FAQPage",\n    "mainEntity": [\n      {ents}\n    ]\n  }}'
        page = page.replace(ld_blocks[2], f'<script type="application/ld+json">\n  {faq_ld}\n  </script>')
    else:
        page = page.replace(ld_blocks[2], "")

    # --- breadcrumb visible
    page = sub1(r'<a href="/blog">Blog</a><span class="sep">/</span><span>.*?</span>',
                f'<a href="/blog">Blog</a><span class="sep">/</span><span>{short}</span>', page)
    # --- banner: replace image with a gradient tile (no per-article photos)
    page = sub1(r'<div class="article-banner fade-up">[\s\S]*?</div>',
                f'<div class="article-banner fade-up" style="background:{grad};height:220px;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:4rem;">{emoji}</div>', page)
    # --- header meta / h1 / excerpt / dates
    page = sub1(r'<span class="blog-card-category">.*?</span>\s*<span class="blog-card-read">.*?</span>',
                f'<span class="blog-card-category{" sc-accent" if "SoundCloud" in category else ""}">{category}</span>\n              <span class="blog-card-read">{read_min} min read</span>', page, re.S)
    page = sub1(r"<h1>[\s\S]*?</h1>", f"<h1>{html.escape(h1, quote=False)}</h1>", page)
    page = sub1(r'<p class="article-excerpt">[\s\S]*?</p>', f'<p class="article-excerpt">{excerpt_full}</p>', page)
    page = sub1(r'<div class="article-dates">[\s\S]*?</div>',
                f'<div class="article-dates">\n              <span>Published: <time datetime="{PUB_DATE}">{PUB_HUMAN}</time></span>\n            </div>', page)
    # --- TOC
    toc_items = "\n".join(f'              <li><a href="#{sid}">{inline(t)}</a></li>' for sid, t in toc)
    page = sub1(r'(<nav class="article-toc fade-up" aria-label="Table of Contents">\s*<h2>Table of Contents</h2>\s*<ol>)[\s\S]*?(</ol>\s*</nav>)',
                lambda m: m.group(1) + "\n" + toc_items + "\n            " + m.group(2), page)
    # --- body
    editorial = f'<div class="article-editorial-note">\n              <strong>Editorial Note:</strong> This article was written by the Breakout music strategy team based on hands-on experience managing thousands of artist promotion campaigns. While we offer paid promotion services, our blog content is intended to be genuinely helpful regardless of whether you use our services. Last updated {PUB_HUMAN}.\n            </div>'
    start_marker = '<div class="article-body fade-up">'
    end_marker = '<!-- Author Box (bottom)'
    si = page.index(start_marker) + len(start_marker)
    ei = page.index(end_marker)
    tail = page[ei:]
    head_part = page[: si]
    page = head_part + "\n\n" + body_html + "\n\n            " + editorial + "\n\n          </div>\n\n          " + tail
    # --- sidebar quick links
    page = sub1(r'(<div class="sidebar-popular fade-up">\s*<h3>In This Article</h3>\s*<ul>)[\s\S]*?(</ul>)',
                lambda m: m.group(1) + "\n" + "\n".join(f'              <li><a href="#{sid}">{inline(t)}</a></li>' for sid, t in toc) + "\n            " + m.group(2), page)

    out = os.path.join(SNAP, slug + ".html")
    open(out, "w", encoding="utf-8").write(page)
    generated.append((num, slug, h1, category, read_min, words, len(toc), len(faq), card_excerpt, emoji, grad))
    print(f"[{num:2d}] {slug}.html  {words}w {read_min}min sections={len(toc)} faq={len(faq)}")

# ---------------------------------------------------------------- report data for listing
import json as _json
open(os.path.join(ROOT, "tools", "articles-manifest.json"), "w", encoding="utf-8").write(
    _json.dumps([
        {"num": n, "slug": s, "title": t, "category": c, "read": r, "words": w,
         "excerpt": ex, "emoji": em, "grad": g}
        for n, s, t, c, r, w, _tc, _fq, ex, em, g in generated
    ], ensure_ascii=False, indent=1))
print("manifest written")
