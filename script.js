const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const defaultState = {
    theme: "dark",
    secretUnlocked: false,
    discoveredComplexes: [],
    openedRecords: [],
    milestones: [],
    observedWorlds: [],
    consoleOpened: false
};

function loadState() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("nekyaState") || "{}"); } catch (_) {}
    const state = { ...defaultState, ...saved };

    if (localStorage.getItem("nekyaTheme") === "fracture") state.theme = "fracture";
    if (localStorage.getItem("nekyaSecretUnlocked") === "true") state.secretUnlocked = true;

    return state;
}

const state = loadState();

function saveState() {
    localStorage.setItem("nekyaState", JSON.stringify(state));
    localStorage.setItem("nekyaTheme", state.theme);
    localStorage.setItem("nekyaSecretUnlocked", String(state.secretUnlocked));
}

function addUnique(array, value) {
    if (!array.includes(value)) array.push(value);
}

if (state.theme === "fracture") document.body.classList.add("fracture-theme");
document.body.classList.add("booting");

const bootScreen = $("#boot-screen");
const bootDots = $("#boot-dots");
let bootDotCount = 1;
const bootDotAnimation = setInterval(() => {
    bootDotCount = bootDotCount >= 3 ? 1 : bootDotCount + 1;
    bootDots.textContent = ".".repeat(bootDotCount);
}, 300);

setTimeout(() => {
    clearInterval(bootDotAnimation);
    bootScreen.classList.add("boot-hide");
    document.body.classList.remove("booting");
}, 2200);

const cursorDot = $("#cursor-dot");
const cursorRing = $("#cursor-ring");
const mouseGlow = $("#mouse-glow");
const gridBackground = $("#grid-background");
let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;

document.addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
    mouseGlow.style.left = mouseX + "px";
    mouseGlow.style.top = mouseY + "px";

    const px = (event.clientX / window.innerWidth - 0.5) * 18;
    const py = (event.clientY / window.innerHeight - 0.5) * 18;
    gridBackground.style.transform = `translate(${px}px, ${py}px)`;
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    requestAnimationFrame(animateCursor);
}
animateCursor();

function refreshCursorTargets() {
    $$('a, button, input, .secret-card').forEach(element => {
        if (element.dataset.cursorReady) return;
        element.dataset.cursorReady = "true";
        element.addEventListener("mouseenter", () => cursorRing.classList.add("cursor-hover"));
        element.addEventListener("mouseleave", () => cursorRing.classList.remove("cursor-hover"));
    });
}
refreshCursorTargets();
document.addEventListener("mousedown", () => cursorRing.classList.add("cursor-click"));
document.addEventListener("mouseup", () => cursorRing.classList.remove("cursor-click"));

const screenGlitch = $("#screen-glitch");
function glitch() {
    screenGlitch.classList.remove("active");
    void screenGlitch.offsetWidth;
    screenGlitch.classList.add("active");
}

const navbar = $("#navbar");
window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 40));

const mobileToggle = $("#mobile-toggle");
const navLinks = $("#nav-links");
mobileToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
$$('a', navLinks).forEach(link => link.addEventListener("click", () => navLinks.classList.remove("open")));

const systemToast = $("#system-toast");
const toastText = $("#toast-text");
let toastTimer;
function showToast(message) {
    toastText.textContent = message;
    systemToast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => systemToast.classList.remove("show"), 2600);
}

const themeToggle = $("#theme-toggle");
const themeIcon = $("#theme-icon");
function updateThemeIcon() {
    const fractureActive = state.theme === "fracture";
    themeIcon.textContent = fractureActive ? "◑" : "◐";
    const nextTheme = fractureActive ? "Dark" : "Fracture light";
    themeToggle.title = `Switch to ${nextTheme} mode`;
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
}
updateThemeIcon();
themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "fracture" ? "dark" : "fracture";
    document.body.classList.toggle("fracture-theme", state.theme === "fracture");
    updateThemeIcon();
    saveState();
    showToast(state.theme === "fracture" ? "FRACTURE MODE ENABLED" : "DARK MODE RESTORED");
});

const particleContainer = $("#ambient-particles");
for (let i = 0; i < 22; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = 100 + Math.random() * 30 + "%";
    particle.style.animationDuration = 8 + Math.random() * 12 + "s";
    particle.style.animationDelay = Math.random() * 12 + "s";
    particleContainer.appendChild(particle);
}

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
$$('.reveal').forEach(element => revealObserver.observe(element));

const trackerLinks = $$('.section-tracker a');
const trackedSections = $$('[data-section]').filter(section => section.id !== "home");
const trackerObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    trackerLinks.forEach(link => link.classList.toggle("active", link.dataset.track === visible.target.id));
}, { threshold: [0.2, 0.45, 0.7] });
trackedSections.forEach(section => trackerObserver.observe(section));

const terminalText = $("#terminal-text");
const terminalMessages = [
    "SCANNING PSYCHE...",
    "COMPLEX SIGNATURE DETECTED.",
    "SEARCHING ARCHIVE...",
    "MEMORY FRAGMENT FOUND.",
    "UNKNOWN RECORD CORRUPTED.",
    "SOMETHING IS WATCHING.",
    "DO NOT TRUST EMPTY DATA."
];
let terminalMessageIndex = 0, terminalCharacterIndex = 0;
function typeTerminal() {
    const current = terminalMessages[terminalMessageIndex];
    if (terminalCharacterIndex < current.length) {
        terminalText.textContent += current.charAt(terminalCharacterIndex++);
        setTimeout(typeTerminal, 55);
    } else setTimeout(deleteTerminal, 1600);
}
function deleteTerminal() {
    if (terminalCharacterIndex > 0) {
        terminalText.textContent = terminalText.textContent.slice(0, -1);
        terminalCharacterIndex--;
        setTimeout(deleteTerminal, 25);
    } else {
        terminalMessageIndex = (terminalMessageIndex + 1) % terminalMessages.length;
        setTimeout(typeTerminal, 350);
    }
}
setTimeout(typeTerminal, 2600);

const complexData = {
    drive: {
        id: "CX-01", name: "DRIVE", rarity: "FAINT", concept: "Forward pressure",
        status: "IN DEVELOPMENT", classification: "PSYCHOLOGICAL MANIFESTATION",
        description: "Drive represents the force that keeps a person moving forward. It converts momentum, intent and refusal to stop into pressure.",
        abilities: ["Ability data is still being finalized.", "Designed around momentum, pressure and forward action."],
        corruption: "NO CORRUPTION DETECTED."
    },
    apathy: {
        id: "CX-02", name: "APATHY", rarity: "FAINT", concept: "Emotional detachment",
        status: "ACTIVE DEVELOPMENT", classification: "PSYCHOLOGICAL MANIFESTATION",
        description: "Apathy turns emotional absence and resistance into power. Its behavior is colder, slower and more retaliatory than Drive.",
        abilities: ["Combat ability set under active development.", "Aura and retaliation systems detected."],
        corruption: "SIGNAL RESPONSE: LOW EMOTIONAL VARIANCE."
    },
    imprint: {
        id: "CX-03", name: "IMPRINT", rarity: "UNDISCLOSED", concept: "What remains",
        status: "DESIGN FILE", classification: "PSYCHOLOGICAL MANIFESTATION",
        description: "Imprint centers on what is left behind: memory, effect, pattern and consequence. Its final gameplay behavior remains undisclosed.",
        abilities: ["PUBLIC ABILITY DATA WITHHELD.", "Manifestation details pending."],
        corruption: "TRACE DATA PERSISTS AFTER FILE CLOSE."
    },
    fixation: {
        id: "CX-04", name: "FIXATION", rarity: "UNDISCLOSED", concept: "Absolute focus",
        status: "DESIGN FILE", classification: "PSYCHOLOGICAL MANIFESTATION",
        description: "Fixation narrows the world until only one object, target or objective matters. Everything else becomes secondary.",
        abilities: ["Target-focused behavior expected.", "PUBLIC ABILITY DATA WITHHELD."],
        corruption: "FOCUS LOCK DETECTED."
    },
    projection: {
        id: "CX-05", name: "PROJECTION", rarity: "UNDISCLOSED", concept: "Mind imposed outward",
        status: "DESIGN FILE", classification: "PSYCHOLOGICAL MANIFESTATION",
        description: "Projection externalizes what should have remained internal. Perception, intent and interpretation begin affecting the world around the user.",
        abilities: ["External manifestation behavior expected.", "PUBLIC ABILITY DATA WITHHELD."],
        corruption: "SOURCE AND TARGET CANNOT BE CLEANLY SEPARATED."
    },
    shadow: {
        id: "CX-06", name: "SHADOW", rarity: "UNDISCLOSED", concept: "Rejected self",
        status: "DESIGN FILE", classification: "PSYCHOLOGICAL MANIFESTATION",
        description: "Shadow represents what is rejected, hidden or denied. It does not disappear simply because someone refuses to acknowledge it.",
        abilities: ["Dark-state behavior expected.", "PUBLIC ABILITY DATA WITHHELD."],
        corruption: "FILE CONTENT CHANGES WHEN UNOBSERVED."
    }
};

const complexOverlay = $("#complex-overlay");
const closeDossier = $("#close-dossier");
function openDossier(key) {
    const data = complexData[key];
    if (!data) return;
    glitch();
    $("#dossier-id").textContent = `${data.id} // DOSSIER`;
    $("#dossier-name").textContent = data.name;
    $("#dossier-rarity").textContent = data.rarity;
    $("#dossier-concept").textContent = data.concept;
    $("#dossier-dev-status").textContent = data.status;
    $("#dossier-classification").textContent = data.classification;
    $("#dossier-description").textContent = data.description;
    $("#dossier-corruption").textContent = data.corruption;
    const list = $("#dossier-abilities");
    list.innerHTML = "";
    data.abilities.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });

    addUnique(state.discoveredComplexes, key);
    addUnique(state.milestones, "complex_viewed");
    saveState();
    updateLoreState();
    complexOverlay.classList.add("active");
    complexOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}
function closeDossierOverlay() {
    complexOverlay.classList.remove("active");
    complexOverlay.setAttribute("aria-hidden", "true");
    if (!$(".secret-overlay.active") && !$(".command-console.active")) document.body.style.overflow = "";
}
closeDossier.addEventListener("click", closeDossierOverlay);
complexOverlay.addEventListener("click", event => { if (event.target === complexOverlay) closeDossierOverlay(); });

const secretCard = $("#secret-card");
const secretTitle = $("#secret-title");
const secretDescription = $("#secret-description");
const secretSignal = $("#secret-signal");
const unknownStatus = $("#unknown-status");
const archiveStatus = $("#archive-status");
const secretOverlay = $("#secret-overlay");
const closeSecret = $("#close-secret");
let secretClicks = 0;
const secretStages = ["SIGNAL DISTURBED", "SOMETHING RESPONDED", "DO NOT CONTINUE", "OBSERVATION DETECTED"];

function applySecretState() {
    secretCard.classList.add("unlocked");
    secretTitle.textContent = "OBSERVED";
    secretDescription.textContent = "THE SIGNAL REMEMBERS YOU.";
    secretSignal.textContent = "ACCESS GRANTED";
    unknownStatus.textContent = "OBSERVED";
    addUnique(state.milestones, "secret");
    updateLoreState();
}
function openSecretOverlay() {
    glitch();
    secretOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}
function closeSecretOverlay() {
    secretOverlay.classList.remove("active");
    if (!$(".complex-overlay.active") && !$(".command-console.active")) document.body.style.overflow = "";
}
function unlockSecret() {
    if (!state.secretUnlocked) showToast("UNKNOWN ARCHIVE UNLOCKED");
    state.secretUnlocked = true;
    addUnique(state.discoveredComplexes, "unknown");
    addUnique(state.milestones, "secret");
    saveState();
    applySecretState();
    setTimeout(openSecretOverlay, 300);
}
function disturbSecret() {
    if (state.secretUnlocked) { openSecretOverlay(); return; }
    secretCard.classList.remove("secret-disturb");
    void secretCard.offsetWidth;
    secretCard.classList.add("secret-disturb");
    secretClicks++;
    if (secretClicks <= 4) secretSignal.textContent = secretStages[secretClicks - 1];
    if (secretClicks === 1) showToast("UNKNOWN SIGNAL DISTURBED");
    if (secretClicks === 2) secretDescription.textContent = "DATA IS MOVING.";
    if (secretClicks === 3) secretTitle.textContent = "? ? ?";
    if (secretClicks === 4) secretDescription.textContent = "STOP OBSERVING.";
    if (secretClicks >= 5) unlockSecret();
}
secretCard.addEventListener("click", disturbSecret);
closeSecret.addEventListener("click", closeSecretOverlay);
secretOverlay.addEventListener("click", event => { if (event.target === secretOverlay) closeSecretOverlay(); });

$$('.complex-card[data-complex]').forEach(card => {
    const key = card.dataset.complex;
    if (key === "unknown") return;
    card.addEventListener("click", () => openDossier(key));
});

$$('.world-card').forEach(card => {
    card.addEventListener("click", () => {
        const world = card.dataset.world;
        addUnique(state.observedWorlds, world);
        addUnique(state.milestones, "world_observed");
        card.classList.add("observed");
        saveState();
        updateLoreState();
        showToast(`${world.toUpperCase()} OBSERVED`);
    });
    if (state.observedWorlds.includes(card.dataset.world)) card.classList.add("observed");
});

const archiveRecords = $$('.archive-record');
const decryptOverlay = $("#decrypt-overlay");
const decryptText = $("#decrypt-text");
const decryptProgress = $("#decrypt-progress");
function requirementMet(requirement) {
    if (!requirement) return true;
    if (requirement === "secret") return state.secretUnlocked;
    return state.milestones.includes(requirement);
}
function decryptAndOpen(record) {
    decryptOverlay.classList.add("active");
    glitch();
    decryptText.textContent = "DECRYPTING...";
    let progress = 0;
    decryptProgress.textContent = "0%";
    const timer = setInterval(() => {
        progress += Math.floor(Math.random() * 18) + 8;
        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);
            decryptProgress.textContent = "100%";
            decryptText.textContent = "ACCESS GRANTED";
            setTimeout(() => {
                decryptOverlay.classList.remove("active");
                record.classList.add("open");
            }, 250);
        } else decryptProgress.textContent = `${progress}%`;
    }, 90);
}
function updateLoreState() {
    archiveRecords.forEach(record => {
        const requirement = record.dataset.requires;
        const unlocked = requirementMet(requirement);
        record.classList.toggle("locked-record", !unlocked);
        record.classList.toggle("unlocked-record", unlocked);
        const status = $(".record-status", record);
        if (unlocked) {
            if (record.dataset.recordId === "unknown") status.textContent = "RECOVERED";
            else if (record.dataset.recordId === "003") status.textContent = "PARTIAL";
            else status.textContent = "AVAILABLE";
        } else status.textContent = record.dataset.recordId === "unknown" ? "RESTRICTED" : "LOCKED";
    });

    if (state.secretUnlocked) {
        $("#restricted-text").textContent = "The archive remembers what was removed. The signal does not identify itself. One fragment remains: U M B R A.";
    }

    const unlockedCount = archiveRecords.filter(record => requirementMet(record.dataset.requires)).length;
    const percent = Math.round((unlockedCount / archiveRecords.length) * 100);
    $("#archive-integrity").textContent = `ARCHIVE INTEGRITY // ${percent}%`;
    archiveStatus.textContent = percent === 100 ? "RECOVERED" : "PARTIAL";
}

archiveRecords.forEach(record => {
    const button = $(".record-header", record);
    button.addEventListener("click", () => {
        const requirement = record.dataset.requires;
        if (!requirementMet(requirement)) {
            showToast(requirement === "secret" ? "RESTRICTED FILE // ACCESS DENIED" : "ARCHIVE CONDITION NOT MET");
            glitch();
            return;
        }

        const wasOpen = record.classList.contains("open");
        archiveRecords.forEach(other => { if (other !== record) other.classList.remove("open"); });
        if (wasOpen) { record.classList.remove("open"); return; }

        addUnique(state.openedRecords, record.dataset.recordId);
        saveState();
        if (record.classList.contains("decrypt-record")) decryptAndOpen(record);
        else record.classList.add("open");
    });
});
updateLoreState();
if (state.secretUnlocked) applySecretState();

const commandConsole = $("#command-console");
const closeConsole = $("#close-console");
const commandForm = $("#command-form");
const commandInput = $("#command-input");
const commandOutput = $("#command-output");
function printCommand(html, className = "") {
    const p = document.createElement("p");
    if (className) p.className = className;
    p.innerHTML = html;
    commandOutput.appendChild(p);
    commandOutput.scrollTop = commandOutput.scrollHeight;
}
function openConsole() {
    state.consoleOpened = true;
    saveState();
    commandConsole.classList.add("active");
    commandConsole.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => commandInput.focus(), 20);
}
function closeCommandConsole() {
    commandConsole.classList.remove("active");
    commandConsole.setAttribute("aria-hidden", "true");
    if (!$(".complex-overlay.active") && !$(".secret-overlay.active")) document.body.style.overflow = "";
}
closeConsole.addEventListener("click", closeCommandConsole);
commandConsole.addEventListener("click", event => { if (event.target === commandConsole) closeCommandConsole(); });

function executeCommand(raw) {
    const input = raw.trim();
    if (!input) return;
    const command = input.toLowerCase();
    printCommand(`<b>NEKYA://&gt;</b> ${input}`);

    if (command === "help") {
        printCommand("commands: <strong>help</strong>, <strong>complexes</strong>, <strong>archive</strong>, <strong>status</strong>, <strong>found</strong>, <strong>theme</strong>, <strong>clear</strong>, <strong>???</strong>");
    } else if (command === "complexes") {
        printCommand("CX-01 DRIVE // CX-02 APATHY // CX-03 IMPRINT // CX-04 FIXATION // CX-05 PROJECTION // CX-06 SHADOW // CX-?? UNKNOWN");
    } else if (command === "archive") {
        printCommand(`archive records opened: ${state.openedRecords.length}/${archiveRecords.length}. integrity: ${$("#archive-integrity").textContent.split("//")[1].trim()}`);
    } else if (command === "status") {
        printCommand(`build 0.1 // complexes observed ${state.discoveredComplexes.length}/7 // unknown data ${state.secretUnlocked ? "OBSERVED" : "LOCKED"}`);
    } else if (command === "found") {
        const found = state.discoveredComplexes.length ? state.discoveredComplexes.map(x => x.toUpperCase()).join(", ") : "NONE";
        printCommand(`discovered complex files: ${found}`);
    } else if (command === "theme") {
        state.theme = state.theme === "fracture" ? "dark" : "fracture";
        document.body.classList.toggle("fracture-theme", state.theme === "fracture");
        updateThemeIcon();
        saveState();
        printCommand(`theme changed to ${state.theme.toUpperCase()}`);
    } else if (command === "clear") {
        commandOutput.innerHTML = "";
    } else if (command === "???") {
        printCommand(state.secretUnlocked ? "OBSERVATION CONFIRMED. U M B R A // THIS IS NOT A NAME." : "ACCESS DENIED. THE SIGNAL HAS NOT OBSERVED YOU.", state.secretUnlocked ? "" : "command-error");
        if (state.secretUnlocked) glitch();
    } else if (command.startsWith("open ")) {
        const key = command.slice(5).trim();
        if (complexData[key]) {
            closeCommandConsole();
            openDossier(key);
        } else printCommand("unknown file.", "command-error");
    } else {
        printCommand("unknown command. type help.", "command-error");
    }
}

commandForm.addEventListener("submit", event => {
    event.preventDefault();
    const value = commandInput.value;
    commandInput.value = "";
    executeCommand(value);
});

let typedSequence = "";
const secretCode = "PSYCHE";
document.addEventListener("keydown", event => {
    const isTyping = document.activeElement === commandInput;

    if (event.code === "Backquote" && !isTyping) {
        event.preventDefault();
        commandConsole.classList.contains("active") ? closeCommandConsole() : openConsole();
        return;
    }

    if (event.key === "Escape") {
        closeSecretOverlay();
        closeDossierOverlay();
        closeCommandConsole();
        navLinks.classList.remove("open");
        return;
    }

    if (isTyping) return;
    typedSequence += event.key.toUpperCase();
    if (typedSequence.length > secretCode.length) typedSequence = typedSequence.slice(-secretCode.length);
    if (typedSequence === secretCode) {
        typedSequence = "";
        unlockSecret();
    }
});

saveState();
refreshCursorTargets();
