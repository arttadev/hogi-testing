const snakePath = document.getElementById("snake-path");
const storyEl = document.querySelector(".story");
const snakeOverlay = document.querySelector(".snake-overlay");
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ---- Snake animation ----
if (!prefersReduced) {
  function toCubicPath(pts, tension = 0) {
    if (!pts || pts.length < 2) return "";
    const s = (1 - tension) / 6;
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + s * (p2.x - p0.x);
      const c1y = p1.y + s * (p2.y - p0.y);
      const c2x = p2.x - s * (p3.x - p1.x);
      const c2y = p2.y - s * (p3.y - p1.y);
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  let sectionTop = 0;
  let sectionBottom = 0;

  const ro = new ResizeObserver(setSectionBounds);
  ro.observe(storyEl);
  window.addEventListener("resize", setSectionBounds);

  function setSectionBounds() {
    const rect = storyEl.getBoundingClientRect();
    const y = window.scrollY;
    sectionTop = y + rect.top;
    sectionBottom = sectionTop + rect.height - window.innerHeight;
  }

  function localScroll() {
    const y = window.scrollY;
    if (y <= sectionTop) return 0;
    if (y >= sectionBottom) return Math.max(sectionBottom - sectionTop, 0);
    return y - sectionTop;
  }

  function buildSnake(offsetY) {
    const VIEW_H = 2400;
    const POINTS = 80;
    const step = VIEW_H / POINTS;
    const freq = 0.008;
    const amp = Math.min(offsetY * 0.12, 60);
    const phase = offsetY * 0.002;

    const baseCurve = 60;
    const basePhase = 0;

    const pts = [];
    for (let i = 0; i <= POINTS; i++) {
      const y = i * step;

      const initialCurve = Math.max(0, 1 - i / 20) * -40;

      const x =
        50 +
        baseCurve * Math.sin(freq * y + basePhase) +
        amp * Math.sin(freq * y + phase) +
        initialCurve;
      pts.push({ x, y });
    }
    return toCubicPath(pts, 0);
  }

  let snakeActive = false;
  let rafQueued = false;

  function toggleSnake() {
    const top = sectionTop - window.scrollY;
    const bottom = sectionBottom - window.scrollY + window.innerHeight;
    const isOn = top <= 0 && bottom > 0;
    if (isOn) {
      if (!snakeActive) {
        snakeActive = true;

        snakePath.setAttribute("d", buildSnake(localScroll()));
      }
    } else if (snakeActive) {
      snakeActive = false;
    }
  }

  function onScroll() {
    toggleSnake();
    if (!snakeActive || rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(() => {
      snakePath.setAttribute("d", buildSnake(localScroll()));
      rafQueued = false;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setSectionBounds();
    snakePath.setAttribute("d", buildSnake(0));
    toggleSnake();
  });
  window.addEventListener("scroll", onScroll, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  const outro = document.querySelector(".outro__content");
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  // Observer for sections
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target.querySelector(".copy-card");
        if (entry.isIntersecting && card && !card.classList.contains("is-in")) {
          card.classList.add("is-in");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px",
    }
  );

  const outroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-in");
      });
    },
    { threshold: 0.1 }
  );

  if (isMobile) {
    document.querySelectorAll(".copy-card").forEach((card) => {
      card.classList.remove("is-in");
    });
  } else {
    const firstCard = document.querySelector("#section-approach .copy-card");
    if (firstCard) firstCard.classList.add("is-in");
  }

  document
    .querySelectorAll(".section")
    .forEach((s) => sectionObserver.observe(s));
  if (outro) outroObserver.observe(outro);
});
