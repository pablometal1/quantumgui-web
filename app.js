/* QuantumGUI Website — M3 Dynamic Theme, Copy, and Docs Search */

(function () {
  const root = document.documentElement;
  const savedMode = localStorage.getItem("qgui_mode") || "light";
  const savedSeed = localStorage.getItem("qgui_seed") || "violet";

  function applyTheme(mode, seed) {
    root.setAttribute("data-mode", mode);
    root.setAttribute("data-seed", seed);
    localStorage.setItem("qgui_mode", mode);
    localStorage.setItem("qgui_seed", seed);

    const modeBtn = document.getElementById("modeToggle");
    if (modeBtn) {
      modeBtn.textContent = mode === "dark" ? "☀" : "☾";
      modeBtn.title = mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
    }

    document.querySelectorAll(".seed-dot").forEach((dot) => {
      dot.classList.toggle("active", dot.dataset.seed === seed);
    });
  }

  applyTheme(savedMode, savedSeed);

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(
      localStorage.getItem("qgui_mode") || "light",
      localStorage.getItem("qgui_seed") || "violet"
    );

    const modeBtn = document.getElementById("modeToggle");
    if (modeBtn) {
      modeBtn.addEventListener("click", () => {
        const next = root.getAttribute("data-mode") === "dark" ? "light" : "dark";
        applyTheme(next, root.getAttribute("data-seed") || "violet");
      });
    }

    document.querySelectorAll(".seed-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        applyTheme(root.getAttribute("data-mode") || "light", dot.dataset.seed);
      });
    });

    // Copy buttons
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = btn.getAttribute("data-copy");
        try {
          await navigator.clipboard.writeText(text);
          const prev = btn.textContent;
          btn.textContent = "Copiado ✓";
          setTimeout(() => (btn.textContent = prev), 1500);
        } catch {
          btn.textContent = "Error";
        }
      });
    });

    // Syntax highlighting (Python + CLI/Shell) for all <pre><code> blocks without manual spans
    const PY_KEYWORDS = new Set([
      "False", "None", "True", "and", "as", "assert", "async", "await", "break",
      "class", "continue", "def", "del", "elif", "else", "except", "finally",
      "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
      "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
    ]);
    const SH_COMMANDS = new Set(["pip", "python", "python3", "quantumgui", "cd", "git", "pytest"]);

    function escHtml(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function highlightCode(raw) {
      // Single-pass tokenizer: comments, strings, decorators, CLI flags, numbers, keyword-args, calls, identifiers
      const tokenRe = /(#[^\n]*)|([frbuFRBU]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(@[A-Za-z_]\w*)|(\B--?[A-Za-z0-9][\w-]*)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)(?=\s*=(?!=))|\b([A-Za-z_]\w*)(?=\s*\()|\b([A-Za-z_]\w*)\b/g;
      let out = "";
      let last = 0;
      let m;
      while ((m = tokenRe.exec(raw)) !== null) {
        if (m.index > last) out += escHtml(raw.slice(last, m.index));
        const [full, comment, str, dec, flag, num, kwarg, call, ident] = m;
        if (comment) {
          out += `<span class="cm">${escHtml(comment)}</span>`;
        } else if (str) {
          out += `<span class="str">${escHtml(str)}</span>`;
        } else if (dec) {
          out += `<span class="dec">${escHtml(dec)}</span>`;
        } else if (flag) {
          out += `<span class="sh-flag">${escHtml(flag)}</span>`;
        } else if (num) {
          out += `<span class="num">${escHtml(num)}</span>`;
        } else if (kwarg) {
          if (PY_KEYWORDS.has(kwarg)) {
            out += `<span class="kw">${escHtml(kwarg)}</span>`;
          } else {
            out += `<span class="arg">${escHtml(kwarg)}</span>`;
          }
        } else if (call) {
          if (PY_KEYWORDS.has(call)) {
            out += `<span class="kw">${escHtml(call)}</span>`;
          } else if (/^[A-Z]/.test(call)) {
            out += `<span class="cls">${escHtml(call)}</span>`;
          } else {
            out += `<span class="fn">${escHtml(call)}</span>`;
          }
        } else if (ident) {
          if (PY_KEYWORDS.has(ident)) {
            out += `<span class="kw">${escHtml(ident)}</span>`;
          } else if (SH_COMMANDS.has(ident)) {
            out += `<span class="fn">${escHtml(ident)}</span>`;
          } else if (/^[A-Z][A-Za-z0-9_]*$/.test(ident)) {
            out += `<span class="cls">${escHtml(ident)}</span>`;
          } else {
            out += escHtml(ident);
          }
        } else {
          out += escHtml(full);
        }
        last = tokenRe.lastIndex;
      }
      if (last < raw.length) out += escHtml(raw.slice(last));
      return out;
    }

    document.querySelectorAll(".code-card pre code, .api-sig").forEach((el) => {
      if (el.querySelector("span")) return;
      el.innerHTML = highlightCode(el.textContent || "");
    });

    // Interactive chips in landing playground
    document.querySelectorAll(".chip[data-toggle]").forEach((chip) => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("selected");
        const label = chip.dataset.label;
        chip.textContent = chip.classList.contains("selected") ? `✓ ${label}` : label;
      });
    });

    // Roadmap status filter chips
    const filterChips = document.querySelectorAll(".chip[data-filter]");
    if (filterChips.length) {
      const phases = document.querySelectorAll(".phase-card[data-status]");
      filterChips.forEach((chip) => {
        chip.addEventListener("click", () => {
          filterChips.forEach((c) => c.classList.remove("selected"));
          chip.classList.add("selected");
          const target = chip.dataset.filter;
          phases.forEach((card) => {
            card.style.display = target === "all" || card.dataset.status === target ? "" : "none";
          });
        });
      });
    }

    // Docs search + category filter
    const search = document.getElementById("apiSearch");
    const catChips = Array.from(document.querySelectorAll(".chip[data-cat-filter]"));
    if (search || catChips.length) {
      const sections = Array.from(document.querySelectorAll(".api-section"));
      const banners = Array.from(document.querySelectorAll(".api-category-banner"));
      const groups = Array.from(document.querySelectorAll(".sidebar-group"));
      const links = Array.from(document.querySelectorAll(".sidebar-link"));
      let activeCat = "all";

      function applyDocsFilter() {
        const q = search ? search.value.trim().toLowerCase() : "";
        const visibleCats = new Set();

        sections.forEach((sec) => {
          const cat = sec.dataset.category || "";
          const catOk = activeCat === "all" || cat === activeCat;
          const textOk = !q || sec.textContent.toLowerCase().includes(q);
          const show = catOk && textOk;
          sec.style.display = show ? "" : "none";
          if (show && cat) visibleCats.add(cat);
        });

        banners.forEach((b) => {
          const cat = b.dataset.category || "";
          b.style.display = visibleCats.has(cat) ? "" : "none";
        });

        links.forEach((link) => {
          const targetId = link.getAttribute("href").slice(1);
          const target = document.getElementById(targetId);
          link.style.display = !target || target.style.display !== "none" ? "" : "none";
        });

        groups.forEach((grp) => {
          const anyVisible = Array.from(grp.querySelectorAll(".sidebar-link")).some(
            (l) => l.style.display !== "none"
          );
          grp.style.display = anyVisible ? "" : "none";
        });
      }

      if (search) {
        search.addEventListener("input", applyDocsFilter);
      }

      catChips.forEach((chip) => {
        chip.addEventListener("click", () => {
          catChips.forEach((c) => c.classList.remove("selected"));
          chip.classList.add("selected");
          activeCat = chip.dataset.catFilter || "all";
          applyDocsFilter();
        });
      });

      // Instant, layout-shift-proof 1-click anchor navigation (handles lazy images)
      let activeScrollLock = null;
      function scrollToSectionById(rawId, pushHash) {
        const id = decodeURIComponent((rawId || "").replace(/^#/, "")).trim();
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;

        // If hidden by active search/category filter, reset filter so the target is visible
        if (target.style.display === "none") {
          activeCat = "all";
          if (search) search.value = "";
          catChips.forEach((c) => c.classList.toggle("selected", c.dataset.catFilter === "all"));
          applyDocsFilter();
        }

        if (pushHash && window.location.hash !== `#${id}`) {
          history.pushState(null, "", `#${id}`);
        }

        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));

        // Cancel any previous lock
        if (activeScrollLock) {
          activeScrollLock();
          activeScrollLock = null;
        }

        const topOffset = 84;
        const alignNow = () => {
          const rect = target.getBoundingClientRect();
          const desiredTop = window.scrollY + rect.top - topOffset;
          window.scrollTo(0, Math.max(0, Math.round(desiredTop)));
        };

        // Highlight target section briefly so it is unmistakable
        target.style.outline = "2px solid var(--md-primary)";
        target.style.outlineOffset = "3px";
        setTimeout(() => {
          target.style.outline = "";
          target.style.outlineOffset = "";
        }, 1800);

        alignNow();
        requestAnimationFrame(alignNow);

        let userScrolled = false;
        const docsMain = document.querySelector(".docs-main");
        const ro = typeof ResizeObserver !== "undefined" && docsMain
          ? new ResizeObserver(() => {
              if (!userScrolled) alignNow();
            })
          : null;
        if (ro && docsMain) ro.observe(docsMain);

        const onUserInteract = () => {
          userScrolled = true;
          cleanup();
        };
        const cleanup = () => {
          window.removeEventListener("wheel", onUserInteract);
          window.removeEventListener("touchstart", onUserInteract);
          window.removeEventListener("pointerdown", onUserInteract);
          window.removeEventListener("keydown", onUserInteract);
          if (ro) ro.disconnect();
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };

        window.addEventListener("wheel", onUserInteract, { passive: true });
        window.addEventListener("touchstart", onUserInteract, { passive: true });
        window.addEventListener("pointerdown", onUserInteract, { passive: true });
        window.addEventListener("keydown", onUserInteract, { passive: true });

        const timer1 = setTimeout(() => !userScrolled && alignNow(), 150);
        const timer2 = setTimeout(() => !userScrolled && alignNow(), 500);
        const timer3 = setTimeout(cleanup, 3000);
        activeScrollLock = cleanup;
      }

      links.forEach((link) => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href") || "";
          if (href.startsWith("#")) {
            e.preventDefault();
            scrollToSectionById(href, true);
          }
        });
      });

      window.addEventListener("hashchange", () => {
        if (window.location.hash) {
          scrollToSectionById(window.location.hash, false);
        }
      });

      if (window.location.hash) {
        scrollToSectionById(window.location.hash, false);
        window.addEventListener("load", () => {
          if (window.location.hash) scrollToSectionById(window.location.hash, false);
        }, { once: true });
      }
    }
  });
})();
