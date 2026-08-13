/* =============================================================
   Tidewater Swim Academy — site behaviour (vanilla JS)
   1. Mobile navigation
   2. Sticky header state
   3. Scroll reveal
   4. Program filter (services page)
   5. FAQ accordion
   6. Booking form validation
   7. Back-to-top button
   ============================================================= */
(function () {
  "use strict";

  /* 1. Mobile navigation --------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A" && window.innerWidth <= 860) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* 2. Sticky header state ------------------------------------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");

  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 12);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 3. Scroll reveal ------------------------------------------- */
  var revealables = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealables.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = Number(el.getAttribute("data-delay") || 0);
          window.setTimeout(function () {
            el.classList.add("is-visible");
          }, delay);
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealables.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* 4. Program filter ------------------------------------------ */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var programs = document.querySelectorAll("[data-audience]");

  if (filterButtons.length && programs.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-filter");

        filterButtons.forEach(function (other) {
          other.setAttribute("aria-pressed", String(other === button));
        });

        programs.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-audience") === filter;
          card.classList.toggle("is-hidden", !match);
        });

        var count = document.getElementById("filter-count");
        if (count) {
          var shown = document.querySelectorAll("[data-audience]:not(.is-hidden)").length;
          count.textContent =
            "Showing " + shown + " of " + programs.length + " programs.";
        }
      });
    });
  }

  /* 5. FAQ accordion ------------------------------------------- */
  var triggers = document.querySelectorAll(".accordion__trigger");

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      var expanded = trigger.getAttribute("aria-expanded") === "true";

      triggers.forEach(function (other) {
        var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
        other.setAttribute("aria-expanded", "false");
        if (otherPanel) otherPanel.style.maxHeight = "0px";
      });

      if (!expanded && panel) {
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* 6. Booking form validation --------------------------------- */
  var form = document.getElementById("booking-form");

  if (form) {
    var status = document.getElementById("form-status");

    var setError = function (input, message) {
      var field = input.closest(".field");
      if (!field) return;
      var slot = field.querySelector(".error");
      field.classList.toggle("has-error", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (slot) slot.textContent = message || "";
    };

    var validate = function (input) {
      var value = (input.value || "").trim();

      if (input.required && !value) {
        setError(input, "This field is required.");
        return false;
      }
      if (input.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) {
        setError(input, "Enter a valid email address, e.g. name@example.com.");
        return false;
      }
      if (input.type === "tel" && value && value.replace(/[^\d]/g, "").length < 9) {
        setError(input, "Enter a phone number with at least 9 digits.");
        return false;
      }
      if (input.name === "swimmerAge" && value && (Number(value) < 3 || Number(value) > 90)) {
        setError(input, "Swimmer age must be between 3 and 90.");
        return false;
      }
      setError(input, "");
      return true;
    };

    var inputs = form.querySelectorAll("input, select, textarea");

    inputs.forEach(function (input) {
      input.addEventListener("blur", function () {
        validate(input);
      });
      input.addEventListener("input", function () {
        if (input.closest(".field") && input.closest(".field").classList.contains("has-error")) {
          validate(input);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var firstInvalid = null;

      inputs.forEach(function (input) {
        if (input.type === "radio" || input.type === "checkbox") return;
        if (!validate(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        if (status) status.hidden = true;
        firstInvalid.focus();
        return;
      }

      var name = (form.elements.fullName.value || "").trim().split(" ")[0];
      if (status) {
        status.hidden = false;
        status.textContent =
          "Thanks, " + name + " — your request is in. A coach will confirm your trial session within one business day.";
        status.focus();
      }
      form.reset();
      inputs.forEach(function (input) {
        setError(input, "");
      });
    });
  }

  /* 7. Back-to-top --------------------------------------------- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
