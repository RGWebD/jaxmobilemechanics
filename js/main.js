(function () {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-nav]");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeNav() {
    if (!panel || !toggle) return;
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  function openNav() {
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
    const first = panel.querySelector("a");
    if (first) first.focus();
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeNav();
      else openNav();
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
      if (event.key !== "Tab" || !panel.classList.contains("is-open")) return;
      if (window.matchMedia("(min-width: 1080px)").matches) return;
      const items = panel.querySelectorAll("a");
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        toggle.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        toggle.focus();
      }
    });
  }

  const revealNodes = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealNodes.forEach(function (node) { node.classList.add("is-in"); });
  } else {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealNodes.forEach(function (node) { observer.observe(node); });
  }

  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-panel a[href^='#']"));
  const sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-current", link.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });
    sections.forEach(function (section) { spy.observe(section); });
  }

  function jacksonvilleParts(date) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = {};
    fmt.formatToParts(date).forEach(function (part) { parts[part.type] = part.value; });
    return parts;
  }

  const alwaysOpen = { Sunday: 1, Monday: 1, Tuesday: 1, Wednesday: 1, Thursday: 1 };
  try {
    const now = jacksonvilleParts(new Date());
    const day = now.weekday;
    const minutes = Number(now.hour) * 60 + Number(now.minute);
    let open = false;
    if (alwaysOpen[day]) open = true;
    if (day === "Friday" || day === "Saturday") open = minutes >= 9 * 60 && minutes < 22 * 60;
    document.querySelectorAll("[data-open-status]").forEach(function (node) {
      node.hidden = false;
      node.classList.remove("is-open", "is-closed");
      node.classList.add(open ? "is-open" : "is-closed");
      node.textContent = open
        ? "Open now"
        : "Closed now · Fri & Sat hours are 9 a.m.–10 p.m. Eastern";
    });
    document.querySelectorAll("[data-day]").forEach(function (row) {
      row.classList.toggle("is-today", row.getAttribute("data-day") === day);
    });
  } catch (err) {
    /* Hours text in the table still stands if the clock cannot be read. */
  }

  const form = document.querySelector("[data-quote]");
  const thanks = document.querySelector("[data-thanks]");
  if (form && thanks) {
    const smsLink = thanks.querySelector("[data-sms]");
    const edit = thanks.querySelector("[data-edit]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const value = function (key) { return String(data.get(key) || "").trim(); };
      const lines = [
        "Quote request — Jacksonville Mobile Mechanics",
        "Name: " + value("name"),
        "Phone: " + value("phone"),
        "Vehicle: " + [value("year"), value("make"), value("model")].join(" "),
        "Service: " + value("service"),
        "Location: " + value("location")
      ];
      if (value("time")) lines.push("Preferred time: " + value("time"));
      if (value("notes")) lines.push("Notes: " + value("notes"));
      const sms = "sms:+19048008923?&body=" + encodeURIComponent(lines.join("\n"));
      if (smsLink) smsLink.href = sms;
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus();
      window.setTimeout(function () {
        const link = document.createElement("a");
        link.href = sms;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, 80);
    });
    if (edit) {
      edit.addEventListener("click", function () {
        thanks.hidden = true;
        form.hidden = false;
        const field = form.querySelector("input, select, textarea");
        if (field) field.focus();
      });
    }
  }
})();
