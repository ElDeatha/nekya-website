(() => {
    "use strict";

    /* =====================================================
       SMALL HELPERS
    ====================================================== */

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const safeOn = (element, eventName, handler, options) => {
        if (!element) return;
        element.addEventListener(eventName, handler, options);
    };

    const safeText = (selectorOrElement, value) => {
        const element = typeof selectorOrElement === "string"
            ? $(selectorOrElement)
            : selectorOrElement;

        if (element) {
            element.textContent = value;
        }
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    /* =====================================================
       SAFE PERSISTENT STATE
    ====================================================== */

    const STORAGE_KEY = "nekyaStateStable3";
    const LEGACY_THEME_KEY = "nekyaTheme";
    const LEGACY_SECRET_KEY = "nekyaSecretUnlocked";

    const defaultState = {
        theme: "dark",
        secretUnlocked: false,
        discoveredComplexes: [],
        openedRecords: [],
        observedWorlds: [],
        milestones: [],
        consoleOpened: false
    };

    function sanitizeArray(value) {
        return Array.isArray(value) ? value.filter(item => typeof item === "string") : [];
    }

    function safeStorageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function safeStorageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Website still functions if storage is unavailable.
        }
    }

    function loadState() {
        let saved = {};

        try {
            const raw = safeStorageGet(STORAGE_KEY);
            saved = raw ? JSON.parse(raw) : {};
        } catch (error) {
            saved = {};
        }

        const state = {
            ...defaultState,
            ...saved
        };

        state.theme = state.theme === "fracture" ? "fracture" : "dark";
        state.secretUnlocked = Boolean(state.secretUnlocked);
        state.discoveredComplexes = sanitizeArray(state.discoveredComplexes);
        state.openedRecords = sanitizeArray(state.openedRecords);
        state.observedWorlds = sanitizeArray(state.observedWorlds);
        state.milestones = sanitizeArray(state.milestones);
        state.consoleOpened = Boolean(state.consoleOpened);

        const legacyTheme = safeStorageGet(LEGACY_THEME_KEY);
        const legacySecret = safeStorageGet(LEGACY_SECRET_KEY);

        if (legacyTheme === "fracture" || legacyTheme === "dark") {
            state.theme = legacyTheme;
        }

        if (legacySecret === "true") {
            state.secretUnlocked = true;
        }

        return state;
    }

    const state = loadState();

    function saveState() {
        safeStorageSet(STORAGE_KEY, JSON.stringify(state));
        safeStorageSet(LEGACY_THEME_KEY, state.theme);
        safeStorageSet(LEGACY_SECRET_KEY, String(state.secretUnlocked));
    }

    function addUnique(list, value) {
        if (!Array.isArray(list)) return;
        if (!list.includes(value)) {
            list.push(value);
        }
    }

    /* =====================================================
       BOOTSTRAP
    ====================================================== */

    function init() {
        applyTheme(false);
        initBoot();
        initCursor();
        initGlitch();
        initNavigation();
        initParticles();
        initRevealAnimations();
        initSectionTracker();
        initStatusTyping();
        initWorldCards();
        initComplexDossiers();
        initSecretSystem();
        initArchive();
        initCommandConsole();
        initGlobalKeyboard();
        updateLoreState();
        restoreObservedWorlds();
        restoreSecretState();
        refreshCursorTargets();
        saveState();

        document.documentElement.classList.add("nekya-ready");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }

    /* =====================================================
       THEME
    ====================================================== */

    function applyTheme(showMessage = true) {
        const fracture = state.theme === "fracture";

        document.body.classList.toggle("fracture-theme", fracture);

        const metaTheme = $('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute("content", fracture ? "#e9e5de" : "#050505");
        }

        const themeIcon = $("#theme-icon");
        const themeToggle = $("#theme-toggle");

        if (themeIcon) {
            themeIcon.textContent = fracture ? "◑" : "◐";
        }

        if (themeToggle) {
            const nextTheme = fracture ? "dark" : "light";
            themeToggle.title = `Switch to ${nextTheme} mode`;
            themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
        }

        if (showMessage) {
            showToast(fracture ? "FRACTURE LIGHT MODE ENABLED" : "DARK MODE RESTORED");
        }
    }

    function toggleTheme() {
        state.theme = state.theme === "fracture" ? "dark" : "fracture";
        applyTheme(true);
        saveState();
    }

    /* =====================================================
       BOOT SCREEN
    ====================================================== */

    function initBoot() {
        const bootScreen = $("#boot-screen");
        const bootDots = $("#boot-dots");

        if (!bootScreen) return;

        document.body.classList.add("booting");

        let dotCount = 1;

        const dotTimer = window.setInterval(() => {
            dotCount = dotCount >= 3 ? 1 : dotCount + 1;
            if (bootDots) {
                bootDots.textContent = ".".repeat(dotCount);
            }
        }, 280);

        window.setTimeout(() => {
            window.clearInterval(dotTimer);
            bootScreen.classList.add("boot-hide");
            document.body.classList.remove("booting");
        }, 1800);
    }

    /* =====================================================
       CUSTOM CURSOR + PARALLAX
    ====================================================== */

    let cursorDot = null;
    let cursorRing = null;
    let mouseGlow = null;
    let gridBackground = null;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let cursorFrame = null;

    function initCursor() {
        cursorDot = $("#cursor-dot");
        cursorRing = $("#cursor-ring");
        mouseGlow = $("#mouse-glow");
        gridBackground = $("#grid-background");

        const finePointer = window.matchMedia
            ? window.matchMedia("(pointer: fine)").matches
            : true;

        const reducedMotion = window.matchMedia
            ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
            : false;

        if (!finePointer || reducedMotion) return;

        document.addEventListener("mousemove", event => {
            mouseX = event.clientX;
            mouseY = event.clientY;

            if (cursorDot) {
                cursorDot.style.left = `${mouseX}px`;
                cursorDot.style.top = `${mouseY}px`;
            }

            if (mouseGlow) {
                mouseGlow.style.left = `${mouseX}px`;
                mouseGlow.style.top = `${mouseY}px`;
            }

            if (gridBackground) {
                const offsetX = (event.clientX / window.innerWidth - 0.5) * 18;
                const offsetY = (event.clientY / window.innerHeight - 0.5) * 18;
                gridBackground.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
            }
        });

        document.addEventListener("mousedown", () => {
            cursorRing?.classList.add("cursor-click");
        });

        document.addEventListener("mouseup", () => {
            cursorRing?.classList.remove("cursor-click");
        });

        const animate = () => {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;

            if (cursorRing) {
                cursorRing.style.left = `${ringX}px`;
                cursorRing.style.top = `${ringY}px`;
            }

            cursorFrame = requestAnimationFrame(animate);
        };

        cursorFrame = requestAnimationFrame(animate);
    }

    function refreshCursorTargets() {
        if (!cursorRing) return;

        $$('a, button, input, [role="button"]').forEach(element => {
            if (element.dataset.cursorReady === "true") return;

            element.dataset.cursorReady = "true";

            safeOn(element, "mouseenter", () => {
                cursorRing?.classList.add("cursor-hover");
            });

            safeOn(element, "mouseleave", () => {
                cursorRing?.classList.remove("cursor-hover");
            });
        });
    }

    /* =====================================================
       GLITCH
    ====================================================== */

    let screenGlitch = null;

    function initGlitch() {
        screenGlitch = $("#screen-glitch");
    }

    function glitch() {
        if (!screenGlitch) return;

        screenGlitch.classList.remove("active");
        void screenGlitch.offsetWidth;
        screenGlitch.classList.add("active");

        window.setTimeout(() => {
            screenGlitch?.classList.remove("active");
        }, 260);
    }

    /* =====================================================
       NAVIGATION
    ====================================================== */

    function initNavigation() {
        const navbar = $("#navbar");
        const mobileToggle = $("#mobile-toggle");
        const navLinks = $("#nav-links");
        const themeToggle = $("#theme-toggle");

        const updateNavbar = () => {
            navbar?.classList.toggle("scrolled", window.scrollY > 40);
        };

        updateNavbar();
        window.addEventListener("scroll", updateNavbar, { passive: true });

        safeOn(themeToggle, "click", toggleTheme);

        safeOn(mobileToggle, "click", () => {
            const open = !navLinks?.classList.contains("open");

            navLinks?.classList.toggle("open", open);
            mobileToggle?.classList.toggle("open", open);
            mobileToggle?.setAttribute("aria-expanded", String(open));
        });

        if (navLinks) {
            $$('a', navLinks).forEach(link => {
                safeOn(link, "click", () => {
                    navLinks.classList.remove("open");
                    mobileToggle?.classList.remove("open");
                    mobileToggle?.setAttribute("aria-expanded", "false");
                });
            });
        }
    }

    /* =====================================================
       PARTICLES
    ====================================================== */

    function initParticles() {
        const container = $("#ambient-particles");
        if (!container) return;

        const reducedMotion = window.matchMedia
            ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
            : false;

        if (reducedMotion) return;

        const amount = window.innerWidth < 700 ? 12 : 22;

        for (let index = 0; index < amount; index += 1) {
            const particle = document.createElement("span");
            particle.className = "particle";
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${100 + Math.random() * 25}%`;
            particle.style.animationDuration = `${8 + Math.random() * 12}s`;
            particle.style.animationDelay = `${Math.random() * 12}s`;
            container.appendChild(particle);
        }
    }

    /* =====================================================
       REVEAL ANIMATIONS
    ====================================================== */

    function initRevealAnimations() {
        const elements = $$(".reveal");
        if (!elements.length) return;

        if (!("IntersectionObserver" in window)) {
            elements.forEach(element => element.classList.add("visible"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.08,
            rootMargin: "0px 0px -40px 0px"
        });

        elements.forEach(element => observer.observe(element));
    }

    /* =====================================================
       SECTION TRACKER
    ====================================================== */

    function initSectionTracker() {
        const links = $$(".section-tracker a");
        const sections = $$("[data-section]").filter(section => section.id !== "home");

        if (!links.length || !sections.length) return;

        if (!("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;

            links.forEach(link => {
                link.classList.toggle(
                    "active",
                    link.dataset.track === visible.target.id
                );
            });
        }, {
            threshold: [0.15, 0.3, 0.5, 0.7]
        });

        sections.forEach(section => observer.observe(section));
    }

    /* =====================================================
       STATUS TERMINAL TYPING
    ====================================================== */

    function initStatusTyping() {
        const terminalText = $("#terminal-text");
        if (!terminalText) return;

        const messages = [
            "SCANNING PSYCHE...",
            "COMPLEX SIGNATURE DETECTED.",
            "SEARCHING ARCHIVE...",
            "MEMORY FRAGMENT FOUND.",
            "UNKNOWN RECORD CORRUPTED.",
            "SOMETHING IS WATCHING.",
            "DO NOT TRUST EMPTY DATA."
        ];

        let messageIndex = 0;
        let characterIndex = 0;
        let deleting = false;

        const tick = () => {
            const current = messages[messageIndex];

            if (!deleting) {
                terminalText.textContent = current.slice(0, characterIndex + 1);
                characterIndex += 1;

                if (characterIndex >= current.length) {
                    deleting = true;
                    window.setTimeout(tick, 1500);
                    return;
                }

                window.setTimeout(tick, 52);
                return;
            }

            terminalText.textContent = current.slice(0, Math.max(characterIndex - 1, 0));
            characterIndex -= 1;

            if (characterIndex <= 0) {
                deleting = false;
                messageIndex = (messageIndex + 1) % messages.length;
                window.setTimeout(tick, 300);
                return;
            }

            window.setTimeout(tick, 24);
        };

        window.setTimeout(tick, 2100);
    }

    /* =====================================================
       WORLD OBSERVATION
    ====================================================== */

    function initWorldCards() {
        $$(".world-card[data-world]").forEach(card => {
            safeOn(card, "click", () => {
                const world = card.dataset.world;
                if (!world) return;

                const wasNew = !state.observedWorlds.includes(world);

                addUnique(state.observedWorlds, world);
                addUnique(state.milestones, "world_observed");

                card.classList.add("observed");
                safeText($("small", card), "OBSERVED");

                saveState();
                updateLoreState();

                showToast(
                    wasNew
                        ? `${world.toUpperCase()} OBSERVED // ARCHIVE UPDATED`
                        : `${world.toUpperCase()} ALREADY OBSERVED`
                );
            });
        });
    }

    function restoreObservedWorlds() {
        $$(".world-card[data-world]").forEach(card => {
            const world = card.dataset.world;

            if (world && state.observedWorlds.includes(world)) {
                card.classList.add("observed");
                safeText($("small", card), "OBSERVED");
            }
        });
    }

    /* =====================================================
       COMPLEX DOSSIER DATA
    ====================================================== */

    const complexData = {
        drive: {
            id: "CX-01",
            name: "DRIVE",
            rarity: "FAINT",
            concept: "Forward pressure",
            status: "IN DEVELOPMENT",
            classification: "PSYCHOLOGICAL MANIFESTATION",
            description:
                "Drive represents the force that keeps a person moving forward. It turns momentum, intent and refusal to stop into pressure.",
            abilities: [
                "Ability data is still being finalized.",
                "Designed around momentum, pressure and forward action."
            ],
            corruption: "NO CORRUPTION DETECTED."
        },

        apathy: {
            id: "CX-02",
            name: "APATHY",
            rarity: "FAINT",
            concept: "Emotional detachment",
            status: "ACTIVE DEVELOPMENT",
            classification: "PSYCHOLOGICAL MANIFESTATION",
            description:
                "Apathy turns emotional absence and resistance into power. Its behavior is colder, slower and more retaliatory than Drive.",
            abilities: [
                "Combat ability set under active development.",
                "Aura and retaliation systems detected."
            ],
            corruption: "SIGNAL RESPONSE: LOW EMOTIONAL VARIANCE."
        },

        imprint: {
            id: "CX-03",
            name: "IMPRINT",
            rarity: "UNDISCLOSED",
            concept: "What remains",
            status: "DESIGN FILE",
            classification: "PSYCHOLOGICAL MANIFESTATION",
            description:
                "Imprint centers on what is left behind: memory, effect, pattern and consequence. Its final gameplay behavior remains undisclosed.",
            abilities: [
                "PUBLIC ABILITY DATA WITHHELD.",
                "Manifestation details pending."
            ],
            corruption: "TRACE DATA PERSISTS AFTER FILE CLOSE."
        },

        fixation: {
            id: "CX-04",
            name: "FIXATION",
            rarity: "UNDISCLOSED",
            concept: "Absolute focus",
            status: "DESIGN FILE",
            classification: "PSYCHOLOGICAL MANIFESTATION",
            description:
                "Fixation narrows the world until only one object, target or objective matters. Everything else becomes secondary.",
            abilities: [
                "Target-focused behavior expected.",
                "PUBLIC ABILITY DATA WITHHELD."
            ],
            corruption: "FOCUS LOCK DETECTED."
        },

        projection: {
            id: "CX-05",
            name: "PROJECTION",
            rarity: "UNDISCLOSED",
            concept: "Mind imposed outward",
            status: "DESIGN FILE",
            classification: "PSYCHOLOGICAL MANIFESTATION",
            description:
                "Projection externalizes what should have remained internal. Perception, intent and interpretation begin affecting the world around the user.",
            abilities: [
                "External manifestation behavior expected.",
                "PUBLIC ABILITY DATA WITHHELD."
            ],
            corruption: "SOURCE AND TARGET CANNOT BE CLEANLY SEPARATED."
        },

        shadow: {
            id: "CX-06",
            name: "SHADOW",
            rarity: "UNDISCLOSED",
            concept: "Rejected self",
            status: "DESIGN FILE",
            classification: "PSYCHOLOGICAL MANIFESTATION",
            description:
                "Shadow represents what is rejected, hidden or denied. It does not disappear simply because someone refuses to acknowledge it.",
            abilities: [
                "Dark-state behavior expected.",
                "PUBLIC ABILITY DATA WITHHELD."
            ],
            corruption: "FILE CONTENT CHANGES WHEN UNOBSERVED."
        }
    };

    let complexOverlay = null;

    function initComplexDossiers() {
        complexOverlay = $("#complex-overlay");

        const closeButton = $("#close-dossier");

        safeOn(closeButton, "click", closeDossier);

        safeOn(complexOverlay, "click", event => {
            if (event.target === complexOverlay) {
                closeDossier();
            }
        });

        $$(".complex-card[data-complex]").forEach(card => {
            const key = card.dataset.complex;

            if (!key || key === "unknown") return;

            safeOn(card, "click", () => {
                openDossier(key);
            });
        });
    }

    function openDossier(key) {
        const data = complexData[key];
        if (!data || !complexOverlay) return;

        safeText("#dossier-id", `${data.id} // DOSSIER`);
        safeText("#dossier-name", data.name);
        safeText("#dossier-rarity", data.rarity);
        safeText("#dossier-concept", data.concept);
        safeText("#dossier-dev-status", data.status);
        safeText("#dossier-classification", data.classification);
        safeText("#dossier-description", data.description);
        safeText("#dossier-corruption", data.corruption);
        safeText("#dossier-status", "ACTIVE FILE");

        const list = $("#dossier-abilities");
        if (list) {
            list.innerHTML = "";

            data.abilities.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                list.appendChild(li);
            });
        }

        const firstTime = !state.discoveredComplexes.includes(key);

        addUnique(state.discoveredComplexes, key);
        addUnique(state.milestones, "complex_viewed");

        saveState();
        updateLoreState();

        glitch();
        openModal(complexOverlay);

        if (firstTime) {
            showToast(`${data.id} ${data.name} // DOSSIER RECOVERED`);
        }
    }

    function closeDossier() {
        closeModal(complexOverlay);
    }

    /* =====================================================
       SECRET SYSTEM
    ====================================================== */

    let secretOverlay = null;
    let secretClicks = 0;

    const secretStages = [
        "SIGNAL DISTURBED",
        "SOMETHING RESPONDED",
        "DO NOT CONTINUE",
        "OBSERVATION DETECTED"
    ];

    function initSecretSystem() {
        secretOverlay = $("#secret-overlay");

        const secretCard = $("#secret-card");
        const closeSecret = $("#close-secret");

        safeOn(secretCard, "click", () => {
            if (state.secretUnlocked) {
                openSecretOverlay();
                return;
            }

            secretClicks += 1;

            secretCard?.classList.remove("secret-disturb");
            if (secretCard) void secretCard.offsetWidth;
            secretCard?.classList.add("secret-disturb");

            if (secretClicks <= secretStages.length) {
                safeText("#secret-signal", secretStages[secretClicks - 1]);
            }

            if (secretClicks === 1) {
                showToast("UNKNOWN SIGNAL DISTURBED");
            }

            if (secretClicks === 2) {
                safeText("#secret-description", "DATA IS MOVING.");
            }

            if (secretClicks === 3) {
                safeText("#secret-title", "? ? ?");
            }

            if (secretClicks === 4) {
                safeText("#secret-description", "STOP OBSERVING.");
                glitch();
            }

            if (secretClicks >= 5) {
                unlockSecret();
            }
        });

        safeOn(closeSecret, "click", closeSecretOverlay);

        safeOn(secretOverlay, "click", event => {
            if (event.target === secretOverlay) {
                closeSecretOverlay();
            }
        });
    }

    function unlockSecret() {
        const wasLocked = !state.secretUnlocked;

        state.secretUnlocked = true;
        addUnique(state.discoveredComplexes, "unknown");
        addUnique(state.milestones, "secret");

        saveState();
        restoreSecretState();
        updateLoreState();

        if (wasLocked) {
            showToast("CX-?? // UNKNOWN ARCHIVE UNLOCKED");
        }

        window.setTimeout(openSecretOverlay, 260);
    }

    function restoreSecretState() {
        if (!state.secretUnlocked) return;

        $("#secret-card")?.classList.add("unlocked");
        safeText("#secret-title", "OBSERVED");
        safeText("#secret-description", "THE SIGNAL REMEMBERS YOU.");
        safeText("#secret-signal", "ACCESS GRANTED");
        safeText("#unknown-status", "OBSERVED");
        safeText("#restricted-status", "RECOVERED");
        safeText(
            "#restricted-text",
            "The archive remembers what was removed. The signal does not identify itself. One fragment remains: U M B R A."
        );
    }

    function openSecretOverlay() {
        if (!secretOverlay) return;
        glitch();
        openModal(secretOverlay);
    }

    function closeSecretOverlay() {
        closeModal(secretOverlay);
    }

    /* =====================================================
       ARCHIVE / LORE PROGRESSION
    ====================================================== */

    let archiveRecords = [];
    let decryptOverlay = null;
    let decryptBusy = false;

    function initArchive() {
        archiveRecords = $$(".archive-record");
        decryptOverlay = $("#decrypt-overlay");

        archiveRecords.forEach(record => {
            const header = $(".record-header", record);

            safeOn(header, "click", () => {
                handleRecordClick(record);
            });
        });
    }

    function requirementMet(requirement) {
        if (!requirement) return true;
        if (requirement === "secret") return state.secretUnlocked;
        return state.milestones.includes(requirement);
    }

    function handleRecordClick(record) {
        if (!record || decryptBusy) return;

        const requirement = record.dataset.requires || "";
        const id = record.dataset.recordId || "unknown";

        if (!requirementMet(requirement)) {
            glitch();
            showToast(
                requirement === "secret"
                    ? "RESTRICTED FILE // ACCESS DENIED"
                    : "ARCHIVE CONDITION NOT MET"
            );
            return;
        }

        const alreadyOpen = record.classList.contains("open");

        archiveRecords.forEach(other => {
            if (other !== record) {
                other.classList.remove("open");
            }
        });

        if (alreadyOpen) {
            record.classList.remove("open");
            return;
        }

        addUnique(state.openedRecords, id);
        saveState();

        if (record.classList.contains("decrypt-record")) {
            decryptAndOpen(record);
        } else {
            record.classList.add("open");
        }
    }

    function decryptAndOpen(record) {
        if (!decryptOverlay || decryptBusy) return;

        decryptBusy = true;
        openModal(decryptOverlay, false);
        decryptOverlay.setAttribute("aria-hidden", "false");

        safeText("#decrypt-text", "DECRYPTING...");
        safeText("#decrypt-progress", "0%");

        const bar = $("#decrypt-bar-fill");
        if (bar) bar.style.width = "0%";

        glitch();

        let progress = 0;

        const timer = window.setInterval(() => {
            progress = clamp(progress + Math.floor(Math.random() * 15) + 9, 0, 100);

            safeText("#decrypt-progress", `${progress}%`);
            if (bar) bar.style.width = `${progress}%`;

            if (progress < 100) return;

            window.clearInterval(timer);
            safeText("#decrypt-text", "ACCESS GRANTED");

            window.setTimeout(() => {
                decryptBusy = false;
                closeModal(decryptOverlay, false);
                decryptOverlay?.setAttribute("aria-hidden", "true");
                record.classList.add("open");
            }, 280);
        }, 85);
    }

    function updateLoreState() {
        const records = archiveRecords.length ? archiveRecords : $$(".archive-record");

        records.forEach(record => {
            const requirement = record.dataset.requires || "";
            const unlocked = requirementMet(requirement);
            const status = $(".record-status", record);
            const recordId = record.dataset.recordId;

            record.classList.toggle("locked-record", !unlocked);
            record.classList.toggle("unlocked-record", unlocked);

            if (!status) return;

            if (!unlocked) {
                status.textContent = recordId === "unknown" ? "RESTRICTED" : "LOCKED";
                return;
            }

            if (recordId === "unknown") {
                status.textContent = "RECOVERED";
            } else if (recordId === "003") {
                status.textContent = "PARTIAL";
            } else {
                status.textContent = "AVAILABLE";
            }
        });

        const total = records.length || 1;
        const unlockedCount = records.filter(record => {
            return requirementMet(record.dataset.requires || "");
        }).length;

        const percent = Math.round((unlockedCount / total) * 100);

        safeText("#archive-integrity", `ARCHIVE INTEGRITY // ${percent}%`);
        safeText("#archive-status", percent >= 100 ? "RECOVERED" : "PARTIAL");

        if (state.secretUnlocked) {
            restoreSecretState();
        }
    }

    /* =====================================================
       COMMAND CONSOLE
    ====================================================== */

    let commandConsole = null;
    let commandInput = null;
    let commandOutput = null;

    function initCommandConsole() {
        commandConsole = $("#command-console");
        commandInput = $("#command-input");
        commandOutput = $("#command-output");

        const closeButton = $("#close-console");
        const form = $("#command-form");

        safeOn(closeButton, "click", closeCommandConsole);

        safeOn(commandConsole, "click", event => {
            if (event.target === commandConsole) {
                closeCommandConsole();
            }
        });

        safeOn(form, "submit", event => {
            event.preventDefault();

            if (!commandInput) return;

            const value = commandInput.value;
            commandInput.value = "";
            executeCommand(value);
        });
    }

    function openCommandConsole() {
        if (!commandConsole) return;

        state.consoleOpened = true;
        saveState();

        openModal(commandConsole);
        commandConsole.setAttribute("aria-hidden", "false");

        window.setTimeout(() => {
            commandInput?.focus();
        }, 30);
    }

    function closeCommandConsole() {
        if (!commandConsole) return;

        closeModal(commandConsole);
        commandConsole.setAttribute("aria-hidden", "true");
    }

    function printCommand(message, className = "") {
        if (!commandOutput) return;

        const paragraph = document.createElement("p");
        if (className) paragraph.className = className;
        paragraph.innerHTML = message;
        commandOutput.appendChild(paragraph);
        commandOutput.scrollTop = commandOutput.scrollHeight;
    }

    function executeCommand(rawValue) {
        const input = String(rawValue || "").trim();
        if (!input) return;

        const command = input.toLowerCase();

        printCommand(`<b>NEKYA://&gt;</b> ${escapeHtml(input)}`);

        if (command === "help") {
            printCommand(
                "commands: <strong>help</strong>, <strong>complexes</strong>, <strong>archive</strong>, <strong>status</strong>, <strong>found</strong>, <strong>theme</strong>, <strong>clear</strong>, <strong>???</strong>, <strong>open &lt;complex&gt;</strong>"
            );
            return;
        }

        if (command === "complexes") {
            printCommand(
                "CX-01 DRIVE // CX-02 APATHY // CX-03 IMPRINT // CX-04 FIXATION // CX-05 PROJECTION // CX-06 SHADOW // CX-?? UNKNOWN"
            );
            return;
        }

        if (command === "archive") {
            const integrity = $("#archive-integrity")?.textContent || "ARCHIVE INTEGRITY // UNKNOWN";
            printCommand(
                `records opened: ${state.openedRecords.length}/${Math.max(archiveRecords.length, 4)} // ${escapeHtml(integrity)}`
            );
            return;
        }

        if (command === "status") {
            printCommand(
                `build 0.1.03 // complex files observed ${state.discoveredComplexes.length}/7 // unknown data ${state.secretUnlocked ? "OBSERVED" : "LOCKED"}`
            );
            return;
        }

        if (command === "found") {
            const found = state.discoveredComplexes.length
                ? state.discoveredComplexes.map(value => value.toUpperCase()).join(", ")
                : "NONE";

            printCommand(`discovered complex files: ${escapeHtml(found)}`);
            return;
        }

        if (command === "theme") {
            toggleTheme();
            printCommand(`theme changed to ${state.theme.toUpperCase()}`, "command-success");
            return;
        }

        if (command === "clear") {
            if (commandOutput) commandOutput.innerHTML = "";
            return;
        }

        if (command === "???") {
            if (state.secretUnlocked) {
                printCommand("OBSERVATION CONFIRMED. U M B R A // THIS IS NOT A NAME.");
                glitch();
            } else {
                printCommand(
                    "ACCESS DENIED. THE SIGNAL HAS NOT OBSERVED YOU.",
                    "command-error"
                );
            }
            return;
        }

        if (command.startsWith("open ")) {
            const key = command.slice(5).trim();

            if (complexData[key]) {
                closeCommandConsole();
                window.setTimeout(() => openDossier(key), 80);
            } else if (key === "unknown" || key === "???") {
                if (state.secretUnlocked) {
                    closeCommandConsole();
                    window.setTimeout(openSecretOverlay, 80);
                } else {
                    printCommand("UNKNOWN FILE IS LOCKED.", "command-error");
                }
            } else {
                printCommand("unknown file.", "command-error");
            }
            return;
        }

        printCommand("unknown command. type help.", "command-error");
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /* =====================================================
       GLOBAL KEYBOARD SHORTCUTS
    ====================================================== */

    let typedSequence = "";
    const secretCode = "PSYCHE";

    function initGlobalKeyboard() {
        document.addEventListener("keydown", event => {
            const activeElement = document.activeElement;
            const typingInInput = activeElement && (
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA"
            );

            if (event.code === "Backquote" && !typingInInput) {
                event.preventDefault();

                if (commandConsole?.classList.contains("active")) {
                    closeCommandConsole();
                } else {
                    openCommandConsole();
                }

                return;
            }

            if (event.key === "Escape") {
                closeSecretOverlay();
                closeDossier();
                closeCommandConsole();

                const navLinks = $("#nav-links");
                const mobileToggle = $("#mobile-toggle");

                navLinks?.classList.remove("open");
                mobileToggle?.classList.remove("open");
                mobileToggle?.setAttribute("aria-expanded", "false");
                return;
            }

            if (typingInInput) return;

            if (event.key.length === 1) {
                typedSequence += event.key.toUpperCase();

                if (typedSequence.length > secretCode.length) {
                    typedSequence = typedSequence.slice(-secretCode.length);
                }

                if (typedSequence === secretCode) {
                    typedSequence = "";
                    unlockSecret();
                }
            }
        });
    }

    /* =====================================================
       MODAL HELPERS
    ====================================================== */

    function anyModalOpen() {
        return $$(".modal-layer.active").length > 0;
    }

    function openModal(element, updateBody = true) {
        if (!element) return;

        element.classList.add("active");
        element.setAttribute("aria-hidden", "false");

        if (updateBody) {
            document.body.classList.add("modal-open");
        }
    }

    function closeModal(element, updateBody = true) {
        if (!element) return;

        element.classList.remove("active");
        element.setAttribute("aria-hidden", "true");

        if (updateBody) {
            window.setTimeout(() => {
                if (!anyModalOpen()) {
                    document.body.classList.remove("modal-open");
                }
            }, 0);
        }
    }

    /* =====================================================
       TOAST
    ====================================================== */

    let toastTimer = null;

    function showToast(message) {
        const toast = $("#system-toast");
        const text = $("#toast-text");

        if (!toast || !text) return;

        text.textContent = message;
        toast.classList.add("show");

        if (toastTimer) {
            window.clearTimeout(toastTimer);
        }

        toastTimer = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
    }

})();
