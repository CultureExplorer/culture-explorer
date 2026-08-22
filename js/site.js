(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  }

  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll(".nav a[data-nav]").forEach((a) => {
      if (a.dataset.nav === page) a.classList.add("is-active");
    });
  }

  const KEY = "ce_inheritance";
  window.CE = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
      catch { return []; }
    },
    save(items) { localStorage.setItem(KEY, JSON.stringify(items)); },
    earn(entry) {
      const items = window.CE.get();
      if (items.some((i) => i.id === entry.id)) return items;
      items.unshift({ ...entry, earnedAt: new Date().toISOString() });
      window.CE.save(items);
      return items;
    },
    has(id) { return window.CE.get().some((i) => i.id === id); }
  };

  document.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      const f = btn.dataset.filter;
      document.querySelectorAll("[data-kind]").forEach((card) => {
        card.style.display = f === "all" || card.dataset.kind === f ? "" : "none";
      });
    });
  });

  const timerEl = document.querySelector("[data-timer]");
  if (timerEl) {
    let remaining = Number(timerEl.dataset.seconds || 120);
    let running = false;
    let interval;
    const render = () => {
      const m = String(Math.floor(remaining / 60)).padStart(2, "0");
      const s = String(remaining % 60).padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    };
    render();
    const start = document.querySelector("[data-start]");
    const unlock = document.querySelector(".unlock");
    const locked = document.querySelector(".locked-note");
    const finish = () => {
      running = false;
      clearInterval(interval);
      if (unlock) unlock.classList.add("is-open");
      if (locked) locked.style.display = "none";
    };
    if (start) {
      start.addEventListener("click", () => {
        if (running) return;
        running = true;
        start.textContent = "Looking…";
        interval = setInterval(() => {
          remaining -= 1;
          render();
          if (remaining <= 0) finish();
        }, 1000);
      });
    }
    const skip = document.querySelector("[data-unlock]");
    if (skip) skip.addEventListener("click", finish);
    const earnBtn = document.querySelector("[data-earn]");
    if (earnBtn) {
      const update = () => {
        if (window.CE.has(earnBtn.dataset.earn)) {
          earnBtn.textContent = "In your Inheritance";
          earnBtn.disabled = true;
        }
      };
      update();
      earnBtn.addEventListener("click", () => {
        const notes = (document.querySelector(".notes") || {}).value || "";
        window.CE.earn({
          id: earnBtn.dataset.earn,
          title: earnBtn.dataset.title,
          kind: earnBtn.dataset.kind,
          href: earnBtn.dataset.href,
          notes
        });
        update();
      });
    }
  }

  const ledger = document.querySelector("[data-ledger]");
  if (ledger) {
    const items = window.CE.get();
    const count = document.querySelector("[data-count]");
    if (count) count.textContent = items.length;
    if (!items.length) {
      ledger.innerHTML = "<p class='empty-state'>Nothing earned yet. Begin with a work in the Atlas and look before you read.</p>";
    } else {
      ledger.innerHTML = items.map((i) => `
        <div class="ledger-item">
          <div>
            <div class="meta kicker">${i.kind || "Work"}</div>
            <h3><a href="${i.href || "atlas.html"}">${i.title}</a></h3>
            <p class="muted">${i.notes ? i.notes.slice(0, 180) : "Looked with attention."}</p>
          </div>
          <div class="muted">${new Date(i.earnedAt).toLocaleDateString()}</div>
        </div>`).join("");
    }
  }
})();
