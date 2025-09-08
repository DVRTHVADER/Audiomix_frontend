// === Handle Form Submissions ===
async function handleForm(formId, url, audioId, ai = false) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    try {
      const res = await fetch(url, { method: "POST", body: data });

      // --- Parse response safely ---
      let json;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          `Expected JSON but got non-JSON response: ${text.substring(0, 200)}`
        );
      }

      // --- Handle API errors ---
      if (!res.ok || json.success === false) {
        alert("Error: " + (json.error || res.status));
        return;
      }

      // --- AI-specific response handling ---
      if (ai && json.ai_plan) {
        document.getElementById("aiPlan").textContent = json.ai_plan;
      }

      // --- Update audio player ---
      if (json.file) {
        const filename = json.file;
        const audioEl = document.getElementById(audioId);
        audioEl.src = "/stream/" + filename;
        await audioEl.play().catch(() => {
          console.log("Autoplay blocked, user interaction required");
        });
      }
    } catch (err) {
      alert("Request failed: " + err.message);
      console.error(err);
    }
  });
}

// Attach handlers to all forms
handleForm("mixerForm", "/Mixer", "mixerAudio");
handleForm("aiForm", "/ai_mix", "aiAudio", true);
handleForm("loopForm", "/loop", "loopAudio");
handleForm("speedForm", "/change_speed", "speedAudio");

// === Custom Player Logic ===
document.querySelectorAll(".custom-player").forEach((playerUI) => {
  const audioId = playerUI.dataset.player;
  const audio = document.getElementById(audioId);

  const playPauseBtn = playerUI.querySelector(".play-pause");
  const progressBar = playerUI.querySelector(".progress-bar");
  const volumeBar = playerUI.querySelector(".volume-bar");
  const timeDisplay = playerUI.querySelector(".time");

  let isPlaying = false;

  // === Play / Pause toggle ===
  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) audio.pause();
    else audio.play();
  });

  audio.addEventListener("play", () => {
    isPlaying = true;
    playPauseBtn.innerHTML = `<img src="./icons/pause.svg" alt="Pause" width="28" height="28">`;
  });

  audio.addEventListener("pause", () => {
    isPlaying = false;
    playPauseBtn.innerHTML = `<img src="./icons/play.svg" alt="Play" width="28" height="28">`;
  });

  // === Progress + Time ===
  audio.addEventListener("timeupdate", () => {
    progressBar.value = audio.currentTime;
    const current = formatTime(audio.currentTime);
    const total = formatTime(audio.duration);
    timeDisplay.textContent = `${current} / ${total}`;
  });

  audio.addEventListener("loadedmetadata", () => {
    progressBar.max = audio.duration;
  });

  progressBar.addEventListener("input", () => {
    audio.currentTime = progressBar.value;
  });

  // === Volume ===
  volumeBar.addEventListener("input", () => {
    audio.volume = volumeBar.value;
  });

  // === Helper for MM:SS formatting ===
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  }
});
Draggable.create(".box", {
  bounds: ".demo",
  inertia: true,
  onDrag: function () {
    if (!this.hitTest(".demo", "100%")) {
      console.log("hit the edge!");
    }
  },
});
