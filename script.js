// ======================================
// TEXT TO VOICE CONVERTER
// Browser Speech Synthesis Engine
// ======================================

const textInput = document.getElementById("textInput");
const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");

const speakBtn = document.getElementById("speakBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");

const charCount = document.getElementById("charCount");
const statusMessage = document.getElementById("statusMessage");

const speedControl = document.getElementById("speedControl");
const pitchControl = document.getElementById("pitchControl");

const speedValue = document.getElementById("speedValue");
const pitchValue = document.getElementById("pitchValue");


// ======================================
// VARIABLES
// ======================================

let availableVoices = [];
let currentUtterance = null;


// ======================================
// LOAD AVAILABLE VOICES
// ======================================

function loadVoices() {

    availableVoices = window.speechSynthesis.getVoices();

    voiceSelect.innerHTML = "";

    if (availableVoices.length === 0) {

        const option = document.createElement("option");
        option.textContent = "No voices available";
        option.value = "";

        voiceSelect.appendChild(option);

        return;
    }

    availableVoices.forEach((voice, index) => {

        const option = document.createElement("option");

        option.value = index;

        option.textContent =
            voice.name + " (" + voice.lang + ")";

        voiceSelect.appendChild(option);

    });

    updateLanguageOptions();

}


// ======================================
// LANGUAGE FILTER
// ======================================

function updateLanguageOptions() {

    const selectedLanguage = languageSelect.value;

    voiceSelect.innerHTML = "";

    const filteredVoices = availableVoices
        .map((voice, index) => ({
            voice,
            index
        }))
        .filter(item => {

            if (selectedLanguage === "all") {
                return true;
            }

            return item.voice.lang.toLowerCase()
                .startsWith(selectedLanguage.toLowerCase());

        });

    if (filteredVoices.length === 0) {

        const option = document.createElement("option");

        option.textContent = "No voices available for this language";
        option.value = "";

        voiceSelect.appendChild(option);

        return;
    }

    filteredVoices.forEach(item => {

        const option = document.createElement("option");

        option.value = item.index;

        option.textContent =
            item.voice.name + " (" + item.voice.lang + ")";

        voiceSelect.appendChild(option);

    });

}


// ======================================
// LOAD LANGUAGE LIST
// ======================================

function loadLanguages() {

    const languages = new Map();

    availableVoices.forEach(voice => {

        const languageCode = voice.lang.split("-")[0];

        if (!languages.has(languageCode)) {

            languages.set(
                languageCode,
                languageCode
            );

        }

    });

    const languageNames = new Intl.DisplayNames(
        [navigator.language || "en"],
        { type: "language" }
    );

    languageSelect.innerHTML =
        '<option value="all">All Available Voices</option>';

    [...languages.keys()].sort().forEach(code => {

        const option = document.createElement("option");

        option.value = code;

        try {
            option.textContent = languageNames.of(code);
        } catch {
            option.textContent = code;
        }

        languageSelect.appendChild(option);

    });

}


// ======================================
// CHARACTER COUNTER
// ======================================

textInput.addEventListener("input", () => {

    charCount.textContent =
        textInput.value.length + " / 5000 characters";

});


// ======================================
// SPEED CONTROL
// ======================================

speedControl.addEventListener("input", () => {

    speedValue.textContent =
        Number(speedControl.value).toFixed(1) + "x";

});


// ======================================
// PITCH CONTROL
// ======================================

pitchControl.addEventListener("input", () => {

    pitchValue.textContent =
        Number(pitchControl.value).toFixed(1);

});


// ======================================
// GENERATE VOICE
// ======================================

speakBtn.addEventListener("click", () => {

    const text = textInput.value.trim();

    if (!text) {

        statusMessage.textContent =
            "Please enter some text first.";

        return;

    }

    if (!availableVoices.length) {

        statusMessage.textContent =
            "No voices available on this device.";

        return;

    }

    // Stop previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const selectedIndex = Number(voiceSelect.value);

    const selectedVoice = availableVoices[selectedIndex];

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.rate = Number(speedControl.value);
    utterance.pitch = Number(pitchControl.value);

    currentUtterance = utterance;

    utterance.onstart = () => {

        statusMessage.textContent =
            "Speaking your text...";

    };

    utterance.onend = () => {

        statusMessage.textContent =
            "Voice generation completed.";

        currentUtterance = null;

    };

    utterance.onerror = (event) => {

        statusMessage.textContent =
            "Speech error: " + event.error;

        currentUtterance = null;

    };

    window.speechSynthesis.speak(utterance);

});


// ======================================
// PAUSE / RESUME
// ======================================

pauseBtn.addEventListener("click", () => {

    if (window.speechSynthesis.speaking) {

        if (window.speechSynthesis.paused) {

            window.speechSynthesis.resume();

            pauseBtn.textContent = "⏸ Pause";

            statusMessage.textContent =
                "Speech resumed.";

        } else {

            window.speechSynthesis.pause();

            pauseBtn.textContent = "▶ Resume";

            statusMessage.textContent =
                "Speech paused.";

        }

    }

});


// ======================================
// STOP SPEECH
// ======================================

stopBtn.addEventListener("click", () => {

    window.speechSynthesis.cancel();

    currentUtterance = null;

    pauseBtn.textContent = "⏸ Pause";

    statusMessage.textContent =
        "Speech stopped.";

});


// ======================================
// CLEAR TEXT
// ======================================

clearBtn.addEventListener("click", () => {

    window.speechSynthesis.cancel();

    textInput.value = "";

    charCount.textContent = "0 / 5000 characters";

    currentUtterance = null;

    pauseBtn.textContent = "⏸ Pause";

    statusMessage.textContent =
        "Text cleared. Ready for new text.";

});


// ======================================
// LANGUAGE CHANGE
// ======================================

languageSelect.addEventListener("change", () => {

    window.speechSynthesis.cancel();

    updateLanguageOptions();

    statusMessage.textContent =
        "Language filter updated.";

});


// ======================================
// INITIALIZE VOICES
// ======================================

loadVoices();

loadLanguages();

if ("onvoiceschanged" in window.speechSynthesis) {

    window.speechSynthesis.onvoiceschanged = () => {

        loadVoices();

        loadLanguages();

    };

    }
