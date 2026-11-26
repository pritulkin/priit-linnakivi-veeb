(() => {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");
  if (menuToggle && navigation) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    };
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
    });
    navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const liveMessage = document.getElementById("live-message");
  const copyButton = document.querySelector("[data-copy-email]");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const email = copyButton.getAttribute("data-copy-email");
      try {
        await navigator.clipboard.writeText(email);
        if (liveMessage) liveMessage.textContent = "E-posti aadress kopeeritud.";
      } catch {
        const helper = document.createElement("textarea");
        helper.value = email;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (liveMessage) liveMessage.textContent = copied ? "E-posti aadress kopeeritud." : `E-posti aadress: ${email}`;
      }
      const label = copyButton.querySelector("span");
      if (label) {
        const original = label.textContent;
        label.textContent = "Kopeeritud";
        window.setTimeout(() => { label.textContent = original; }, 1800);
      }
    });
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealTargets = document.querySelectorAll(
    ".section-heading, .featured-project, .project-card, .manifesto-copy, .process-step, .contact-inner"
  );
  revealTargets.forEach((element) => element.classList.add("reveal"));
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  const canvas = document.querySelector(".constellation");
  const art = document.querySelector(".hero-art");
  if (canvas && art) {
    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let points = [];
    let pointer = { x: -1000, y: -1000 };
    const resize = () => {
      const rect = art.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      points = Array.from({ length: 34 }, (_, index) => {
        const seed = index * 12.9898;
        return {
          x: ((Math.sin(seed) * 43758.5453) % 1 + 1) % 1 * width,
          y: ((Math.sin(seed * 1.71) * 9631.315) % 1 + 1) % 1 * height,
          radius: index % 7 === 0 ? 1.6 : .8
        };
      });
    };
    const draw = () => {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      points.forEach((point, index) => {
        const dx = pointer.x - point.x;
        const dy = pointer.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const lift = distance < 145 ? (1 - distance / 145) * 10 : 0;
        const x = point.x + (distance < 145 ? -dx / (distance || 1) * lift : 0);
        const y = point.y + (distance < 145 ? -dy / (distance || 1) * lift : 0);
        for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
          const next = points[nextIndex];
          const lineDistance = Math.hypot(point.x - next.x, point.y - next.y);
          if (lineDistance < 92) {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(next.x, next.y);
            context.strokeStyle = `rgba(211, 183, 128, ${0.08 * (1 - lineDistance / 92)})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
        context.beginPath();
        context.arc(x, y, point.radius, 0, Math.PI * 2);
        context.fillStyle = distance < 145 ? "rgba(224, 199, 149, .8)" : "rgba(213, 190, 147, .42)";
        context.fill();
      });
    };
    resize();
    draw();
    if (!reducedMotion) {
      art.addEventListener("pointermove", (event) => {
        const rect = art.getBoundingClientRect();
        pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        draw();
      });
      art.addEventListener("pointerleave", () => { pointer = { x: -1000, y: -1000 }; draw(); });
      window.addEventListener("resize", () => { resize(); draw(); }, { passive: true });
    }
  }

  const soundToggle = document.querySelector(".sound-toggle");
  if (soundToggle) {
    let audioContext;
    soundToggle.addEventListener("click", () => {
      const isOn = soundToggle.getAttribute("aria-pressed") === "true";
      soundToggle.setAttribute("aria-pressed", String(!isOn));
      soundToggle.setAttribute("aria-label", isOn ? "Lülita helid sisse" : "Lülita helid välja");
      const label = soundToggle.querySelector(".sound-label");
      if (label) label.textContent = isOn ? "HELI VÄLJAS" : "HELI SEES";
      if (!isOn) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          if (liveMessage) liveMessage.textContent = "Sinu brauser ei toeta veebiheli.";
          soundToggle.setAttribute("aria-pressed", "false");
          if (label) label.textContent = "HELI VÄLJAS";
          return;
        }
        audioContext = audioContext || new AudioContextClass();
        if (audioContext.state === "suspended") audioContext.resume();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.16);
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.025, audioContext.currentTime + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.42);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.43);
      }
    });
  }

  const easterEgg = document.querySelector(".easter-egg");
  const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let sequenceIndex = 0;
  let eggTimer;
  document.addEventListener("keydown", (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    sequenceIndex = key === sequence[sequenceIndex] ? sequenceIndex + 1 : (key === sequence[0] ? 1 : 0);
    if (sequenceIndex === sequence.length) {
      sequenceIndex = 0;
      if (easterEgg) {
        easterEgg.classList.add("is-visible");
        window.clearTimeout(eggTimer);
        eggTimer = window.setTimeout(() => easterEgg.classList.remove("is-visible"), 3600);
      }
    }
  });
  console.info("%cTere tulemast kulisside taha. Hea töö algab heast küsimusest.", "color:#c5a873;font-size:12px;");
})();
