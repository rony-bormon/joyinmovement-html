/**
 * Joy In Movement (J.I.M) - Interactive Application Scripts
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Unified Mobile Navigation System
  let mobileToggle = document.getElementById("mobileToggle");
  if (!mobileToggle) {
    const headerAction = document.querySelector(".header-right, .header-action");
    if (headerAction) {
      mobileToggle = document.createElement("button");
      mobileToggle.id = "mobileToggle";
      mobileToggle.className = "mobile-nav-toggle";
      mobileToggle.setAttribute("aria-label", "Toggle navigation menu");
      mobileToggle.innerHTML = "<span></span><span></span><span></span>";
      headerAction.appendChild(mobileToggle);
    }
  }

  let mobileMenu = document.getElementById("mobileMenu");

  // If mobileMenu doesn't exist on the page yet, dynamically construct it from header-nav
  if (!mobileMenu) {
    const desktopNav = document.querySelector(".header-nav .nav-links-list, .desktop-nav .nav-menu");
    mobileMenu = document.createElement("div");
    mobileMenu.id = "mobileMenu";
    mobileMenu.className = "mobile-menu-drawer";
    mobileMenu.setAttribute("aria-hidden", "true");

    let linksHtml = "";
    if (desktopNav) {
      const links = desktopNav.querySelectorAll("a");
      links.forEach((a) => {
        linksHtml += `<li><a href="${a.getAttribute("href")}" class="mobile-nav-link">${a.textContent.trim()}</a></li>`;
      });
    } else {
      linksHtml = `
        <li><a href="locations.html" class="mobile-nav-link">Locations</a></li>
        <li><a href="infrared.html" class="mobile-nav-link">Infrared Workouts</a></li>
        <li><a href="classes.html" class="mobile-nav-link">Classes</a></li>
        <li><a href="about.html" class="mobile-nav-link">About</a></li>
        <li><a href="press.html" class="mobile-nav-link">Press</a></li>
        <li><a href="articles.html" class="mobile-nav-link">Articles</a></li>
        <li><a href="own-a-jim.html" class="mobile-nav-link">Own A J.I.M</a></li>
        <li><a href="#store" class="mobile-nav-link">Store</a></li>
      `;
    }

    mobileMenu.innerHTML = `
      <div class="mobile-menu-inner">
        <ul class="mobile-nav-list">
          ${linksHtml}
        </ul>
        <a href="classes.html" class="mobile-btn-get-started">GET STARTED</a>
      </div>
    `;
    document.body.appendChild(mobileMenu);
  }

  // Connect Toggle & Links
  if (mobileToggle && mobileMenu) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !mobileMenu.classList.contains("open");
      mobileMenu.classList.toggle("open", isOpen);
      mobileToggle.classList.toggle("active", isOpen);
      mobileMenu.setAttribute("aria-hidden", !isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    mobileMenu.querySelectorAll(".mobile-nav-link, .mobile-btn-get-started").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
        toggleMenu(false);
      }
    });

    // Close on click outside inner content
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) {
        toggleMenu(false);
      }
    });
  }

  // 2. Sticky Header Backdrop on Scroll
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // 3. Studio Location Search & Filter
  const studioSearch = document.getElementById("studioSearch");
  const searchBtn = document.getElementById("searchBtn");
  const studiosGrid = document.getElementById("studiosGrid");
  const studioCards = document.querySelectorAll(".studio-card");

  function filterStudios(query) {
    const q = query.toLowerCase().trim();
    let matchCount = 0;

    studioCards.forEach((card) => {
      const loc = card.getAttribute("data-location") || "";
      const name = card.querySelector(".studio-name")?.textContent?.toLowerCase() || "";
      const address = card.querySelector(".studio-address")?.textContent?.toLowerCase() || "";

      if (!q || loc.includes(q) || name.includes(q) || address.includes(q)) {
        card.style.display = "flex";
        card.style.opacity = "1";
        matchCount++;
      } else {
        card.style.display = "none";
      }
    });

    // If no match found, show notice
    let noMatchEl = document.getElementById("noMatchNotice");
    if (matchCount === 0) {
      if (!noMatchEl) {
        noMatchEl = document.createElement("div");
        noMatchEl.id = "noMatchNotice";
        noMatchEl.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 40px; color: #D9D9D9;";
        noMatchEl.innerHTML = `<p>No studio found matching "<strong>${query}</strong>". Explore our Sydney locations above or check back soon!</p>`;
        studiosGrid.appendChild(noMatchEl);
      }
    } else if (noMatchEl) {
      noMatchEl.remove();
    }
  }

  if (studioSearch) {
    studioSearch.addEventListener("input", (e) => filterStudios(e.target.value));
    if (searchBtn) {
      searchBtn.addEventListener("click", () => filterStudios(studioSearch.value));
    }
  }

  // 4. "Use My Current Location" Detection
  const detectBtn = document.getElementById("detectLocationBtn");
  if (detectBtn) {
    detectBtn.addEventListener("click", () => {
      const originalText = detectBtn.innerHTML;
      detectBtn.innerHTML = `<span>Locating nearest studio...</span>`;
      detectBtn.disabled = true;

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Geolocation success simulator for Sydney area
            detectBtn.innerHTML = originalText;
            detectBtn.disabled = false;
            filterStudios("nsw");
            studioCards[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
          },
          (error) => {
            detectBtn.innerHTML = originalText;
            detectBtn.disabled = false;
            // Fallback: reset search and show all locations
            filterStudios("");
            studioCards[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
          },
          { timeout: 5000 },
        );
      } else {
        detectBtn.innerHTML = originalText;
        detectBtn.disabled = false;
        filterStudios("");
      }
    });
  }

  // 5. Scroll Reveal Fade-in Animation
  const revealElements = document.querySelectorAll(
    ".studio-card, .benefit-card, .review-card, .poster-card, .phone-mockup-wrapper",
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    revealElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
      observer.observe(el);
    });
  }

  // 6. Smooth Mouse-Drag to Scroll for Reviews Track
  const reviewTracks = document.querySelectorAll(".reviews-track-wrapper");
  reviewTracks.forEach((track) => {
    // Figma shows the first card partly off-canvas; start the track scrolled to match
    if (track.dataset.startScroll) track.scrollLeft = Number(track.dataset.startScroll);

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener("mousedown", (e) => {
      isDown = true;
      track.classList.add("active");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener("mouseleave", () => {
      isDown = false;
      track.classList.remove("active");
    });

    track.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("active");
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  });

  // 7. Universal Video Player & Cinematic Lightbox Modal
  const JIM_OFFICIAL_VIDEO_URL =
    "https://joyinmovement.com.au/wp-content/uploads/2026/03/JIM_WEBSITE_HERO_4K_NoAudio_compressed_video.mp4";

  let videoModal = document.getElementById("jimVideoModal");
  let modalVideo = null;

  if (!videoModal) {
    videoModal = document.createElement("div");
    videoModal.id = "jimVideoModal";
    videoModal.className = "jim-video-modal";
    videoModal.setAttribute("aria-hidden", "true");
    videoModal.innerHTML = `
      <div class="jim-video-modal-backdrop" id="jimVideoBackdrop"></div>
      <div class="jim-video-modal-dialog">
        <button class="jim-video-modal-close" id="jimVideoClose" aria-label="Close video player">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <video class="jim-video-modal-video" id="jimModalVideoEl" controls playsinline preload="auto">
          <source src="${JIM_OFFICIAL_VIDEO_URL}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
    document.body.appendChild(videoModal);
  }

  modalVideo = document.getElementById("jimModalVideoEl");
  const modalCloseBtn = document.getElementById("jimVideoClose");
  const modalBackdrop = document.getElementById("jimVideoBackdrop");

  function openVideoModal(videoSrc) {
    if (!videoModal || !modalVideo) return;
    const src = videoSrc || JIM_OFFICIAL_VIDEO_URL;
    if (modalVideo.src !== src) {
      modalVideo.src = src;
    }
    videoModal.classList.add("open");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalVideo.play().catch((e) => console.log("Autoplay handled:", e));
  }

  function closeVideoModal() {
    if (!videoModal || !modalVideo) return;
    videoModal.classList.remove("open");
    videoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalVideo.pause();
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeVideoModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeVideoModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoModal && videoModal.classList.contains("open")) {
      closeVideoModal();
    }
  });

  // Attach to ALL Play Buttons across the entire site
  const videoPlayButtons = document.querySelectorAll(`
    .video-play-btn,
    .obsessed-play-btn,
    .wellness-video-play-btn,
    .play-btn-circle,
    .video-play-center-btn,
    [data-video-url],
    [data-video-trigger]
  `);

  videoPlayButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const customUrl =
        btn.getAttribute("data-video-url") || btn.closest("[data-video-url]")?.getAttribute("data-video-url");
      openVideoModal(customUrl || JIM_OFFICIAL_VIDEO_URL);
    });
  });

  // Also enable clicking directly on video cards/frames
  const wellnessFrames = document.querySelectorAll(
    ".wellness-video-frame, .guide-video-wrapper, .video-preview-wrapper, .video-peach-box",
  );
  wellnessFrames.forEach((frame) => {
    frame.style.cursor = "pointer";
    frame.addEventListener("click", () => {
      openVideoModal(JIM_OFFICIAL_VIDEO_URL);
    });
  });
});
