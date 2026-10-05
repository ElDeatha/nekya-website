// =====================================
// BOOT
// =====================================

document.body.classList.add("booting");


const bootScreen =
    document.getElementById("boot-screen");


const bootDots =
    document.getElementById("boot-dots");


let bootDotCount = 1;


const bootDotAnimation =
    setInterval(() => {

        bootDotCount++;

        if (bootDotCount > 3) {
            bootDotCount = 1;
        }

        bootDots.textContent =
            ".".repeat(bootDotCount);

    }, 300);



setTimeout(() => {

    clearInterval(bootDotAnimation);

    bootScreen.classList.add(
        "boot-hide"
    );

    document.body.classList.remove(
        "booting"
    );

}, 2600);



// =====================================
// CUSTOM CURSOR
// =====================================

const cursorDot =
    document.getElementById(
        "cursor-dot"
    );


const cursorRing =
    document.getElementById(
        "cursor-ring"
    );


const mouseGlow =
    document.getElementById(
        "mouse-glow"
    );



let mouseX = -100;
let mouseY = -100;


let ringX = -100;
let ringY = -100;



document.addEventListener(
    "mousemove",
    event => {

        mouseX = event.clientX;

        mouseY = event.clientY;


        cursorDot.style.left =
            mouseX + "px";

        cursorDot.style.top =
            mouseY + "px";


        mouseGlow.style.left =
            mouseX + "px";

        mouseGlow.style.top =
            mouseY + "px";

    }
);



function animateCursor() {

    ringX +=
        (mouseX - ringX) * 0.16;

    ringY +=
        (mouseY - ringY) * 0.16;


    cursorRing.style.left =
        ringX + "px";

    cursorRing.style.top =
        ringY + "px";


    requestAnimationFrame(
        animateCursor
    );

}


animateCursor();



// =====================================
// CURSOR HOVER
// =====================================

const hoverTargets =
    document.querySelectorAll(
        "a, button, .secret-card"
    );


hoverTargets.forEach(
    element => {

        element.addEventListener(
            "mouseenter",
            () => {

                cursorRing.classList.add(
                    "cursor-hover"
                );

            }
        );


        element.addEventListener(
            "mouseleave",
            () => {

                cursorRing.classList.remove(
                    "cursor-hover"
                );

            }
        );

    }
);



document.addEventListener(
    "mousedown",
    () => {

        cursorRing.classList.add(
            "cursor-click"
        );

    }
);



document.addEventListener(
    "mouseup",
    () => {

        cursorRing.classList.remove(
            "cursor-click"
        );

    }
);



// =====================================
// NAVBAR
// =====================================

const navbar =
    document.querySelector("nav");


window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 40) {

            navbar.style.background =
                "rgba(3,3,3,0.82)";

            navbar.style.borderBottomColor =
                "rgba(100,0,0,0.14)";

        }

        else {

            navbar.style.background =
                "transparent";

            navbar.style.borderBottomColor =
                "rgba(255,255,255,0.04)";

        }

    }
);



// =====================================
// REVEAL ON SCROLL
// =====================================

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },

        {
            threshold: 0.1
        }

    );



revealElements.forEach(
    element => {

        revealObserver.observe(
            element
        );

    }
);



// =====================================
// TERMINAL
// =====================================

const terminalText =
    document.getElementById(
        "terminal-text"
    );


const terminalMessages = [

    "SCANNING PSYCHE...",
    "COMPLEX SIGNATURE DETECTED.",
    "SEARCHING FOR ANOMALIES...",
    "MEMORY FRAGMENT FOUND.",
    "SOMETHING IS WATCHING.",
    "DO NOT TRUST EMPTY DATA."

];


let terminalMessageIndex = 0;

let terminalCharacterIndex = 0;



function typeTerminal() {

    const current =
        terminalMessages[
            terminalMessageIndex
        ];


    if (
        terminalCharacterIndex <
        current.length
    ) {

        terminalText.textContent +=
            current.charAt(
                terminalCharacterIndex
            );


        terminalCharacterIndex++;


        setTimeout(
            typeTerminal,
            55
        );

    }

    else {

        setTimeout(
            deleteTerminal,
            1600
        );

    }

}



function deleteTerminal() {

    if (
        terminalCharacterIndex > 0
    ) {

        terminalText.textContent =
            terminalText.textContent.slice(
                0,
                -1
            );


        terminalCharacterIndex--;


        setTimeout(
            deleteTerminal,
            25
        );

    }

    else {

        terminalMessageIndex++;


        if (
            terminalMessageIndex >=
            terminalMessages.length
        ) {

            terminalMessageIndex = 0;

        }


        setTimeout(
            typeTerminal,
            350
        );

    }

}



setTimeout(
    typeTerminal,
    3100
);



// =====================================
// SECRET SYSTEM
// =====================================

const secretCard =
    document.getElementById(
        "secret-card"
    );


const secretTitle =
    document.getElementById(
        "secret-title"
    );


const secretDescription =
    document.getElementById(
        "secret-description"
    );


const secretSignal =
    document.getElementById(
        "secret-signal"
    );


const unknownStatus =
    document.getElementById(
        "unknown-status"
    );


const secretOverlay =
    document.getElementById(
        "secret-overlay"
    );


const closeSecret =
    document.getElementById(
        "close-secret"
    );



let secretClicks = 0;

let secretUnlocked =
    localStorage.getItem(
        "nekyaSecretUnlocked"
    ) === "true";



const secretStages = [

    "SIGNAL DISTURBED",

    "SOMETHING RESPONDED",

    "DO NOT CONTINUE",

    "OBSERVATION DETECTED"

];



function disturbSecret() {

    secretCard.classList.remove(
        "secret-disturb"
    );


    void secretCard.offsetWidth;


    secretCard.classList.add(
        "secret-disturb"
    );


    secretClicks++;


    if (secretClicks <= 4) {

        secretSignal.textContent =
            secretStages[
                secretClicks - 1
            ];

    }


    if (secretClicks === 2) {

        secretDescription.textContent =
            "DATA IS MOVING.";

    }


    if (secretClicks === 3) {

        secretTitle.textContent =
            "? ? ?";

    }


    if (secretClicks === 4) {

        secretDescription.textContent =
            "STOP OBSERVING.";

    }


    if (secretClicks >= 5) {

        unlockSecret();

    }

}



secretCard.addEventListener(
    "click",
    disturbSecret
);



// =====================================
// SECRET KEYBOARD CODE
// =====================================

const secretCode =
    "PSYCHE";


let typedSequence = "";



document.addEventListener(
    "keydown",
    event => {

        typedSequence +=
            event.key.toUpperCase();


        if (
            typedSequence.length >
            secretCode.length
        ) {

            typedSequence =
                typedSequence.slice(
                    -secretCode.length
                );

        }


        if (
            typedSequence ===
            secretCode
        ) {

            unlockSecret();

            typedSequence = "";

        }


        if (
            event.key === "Escape"
        ) {

            closeSecretOverlay();

        }

    }
);



// =====================================
// UNLOCK SECRET
// =====================================

function unlockSecret() {

    secretUnlocked = true;


    localStorage.setItem(
        "nekyaSecretUnlocked",
        "true"
    );


    secretCard.classList.add(
        "unlocked"
    );


    secretTitle.textContent =
        "OBSERVED";


    secretDescription.textContent =
        "THE SIGNAL REMEMBERS YOU.";


    secretSignal.textContent =
        "ACCESS GRANTED";


    unknownStatus.textContent =
        "OBSERVED";


    secretOverlay.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}



// =====================================
// SECRET OVERLAY CLOSE
// =====================================

function closeSecretOverlay() {

    secretOverlay.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}



closeSecret.addEventListener(
    "click",
    closeSecretOverlay
);



secretOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            secretOverlay
        ) {

            closeSecretOverlay();

        }

    }
);



// =====================================
// RESTORE SECRET
// =====================================

if (secretUnlocked) {

    secretCard.classList.add(
        "unlocked"
    );


    secretTitle.textContent =
        "OBSERVED";


    secretDescription.textContent =
        "THE SIGNAL REMEMBERS YOU.";


    secretSignal.textContent =
        "ACCESS GRANTED";


    unknownStatus.textContent =
        "OBSERVED";

}