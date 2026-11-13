// ======================================
// TBOLT TEXT TO VOICE
// Simple Male / Female Voice Selection
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

let availableVoices = [];
let selectedVoice = null;
let currentUtterance = null;


// ======================================
// IDENTIFY VOICE GENDER FROM ITS NAME
// ======================================

function detectGender(voice) {

    const name = voice.name.toLowerCase();

    const femaleNames = [
        "female", "zira", "jenny", "aria",
        "samantha", "susan", "hazel",
        "heera", "swara", "kalpana",
        "aditi", "neerja", "pallavi",
        "raveena", "eva", "michelle",
        "sara", "linda", "natasha"
    ];

    const maleNames = [
        "male", "david", "mark", "guy",
        "daniel", "james", "ryan",
        "christopher", "eric", "brian",
        "thomas", "george", "richard",
        "madhur", "ravi", "aaron",
        "alexander", "arthur", "oliver"
    ];

    if (femaleNames.some(n => name.includes(n))) {
        return "female";
    }

    if (maleNames.some(n => name.includes(n))) {
        return "male";
    }

    return "unknown";
}


// ======================================
// LOAD LANGUAGES
// ======================================

function loadLanguages() {

    const previousLanguage = languageSelect.value;

    const languages = [
        ...new Set(
            availableVoices.map(v => v.lang.split("-")[0])
        )
    ].sort();

    const languageNames = new Intl.DisplayNames(
        [navigator.language || "en"],
        { type: "language" }
    );

    languageSelect.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Languages";

    languageSelect.appendChild(allOption);

    languages.forEach(code => {

        const option = document.createElement("option");

        option.value = code;

        try {
            option.textContent = languageNames.of(code);
        } catch {
            option.textContent = code;
        }

        languageSelect.appendChild(option);
    });

    if (languages.includes(previousLanguage)) {
        languageSelect.value = previousLanguage;
    } else {
        languageSelect.value = "all";
    }

}


// ======================================
// UPDATE MALE / FEMALE VOICES
// ======================================

function updateVoiceOptions() {

    const language = languageSelect.value;

    voiceSelect.innerHTML = "";

    const filteredVoices = availableVoices.filter(voice => {

        return language === "all" ||
            voice.lang.toLowerCase().startsWith(
                language.toLowerCase() + "-"
            ) ||
            voice.lang.toLowerCase() === language.toLowerCase();

    });

    const maleVoice = filteredVoices.find(
        voice => detectGender(voice) === "male"
    );

    const femaleVoice = filteredVoices.find(
        voice => detectGender(voice) === "female"
    );

    const options = [
        { gender: "male", voice: maleVoice },
        { gender: "female", voice: femaleVoice }
    ];

    options.forEach(item => {

        if (!item.voice) return;

        const option = document.createElement("option");

        option.value = item.gender;

        option.textContent =
            item.gender === "male"
                ? "Male Voice"
                : "Female Voice";

        voiceSelect.appendChild(option);

    });

    if (voiceSelect.options.length === 0) {

        const option = document.createElement("option");

        option.value = "";
        option.textContent = "No matching voices available";

        voiceSelect.appendChild(option);

        selectedVoice = null;

        return;
    }

    voiceSelect.selectedIndex = 0;

    updateSelectedVoice();

}


// ======================================
// UPDATE SELECTED VOICE
// ======================================

function updateSelectedVoice() {

    const gender = voiceSelect.value;
    const language = languageSelect.value;

    const filteredVoices = availableVoices.filter(voice => {

        return language === "all" ||
            voice.lang.toLowerCase().startsWith(
                language.toLowerCase() + "-"
            ) ||
            voice.lang.toLowerCase() === language.toLowerCase();

    });

    selectedVoice = filteredVoices.find(
        voice => detectGender(voice) === gender
    );

}


// ======================================
// LOAD DEVICE VOICES
// ======================================

function loadVoices() {

    availableVoices = window.speechSynthesis.getVoices();

    if (!availableVoices.length) return;

    loadLanguages();

    updateVoiceOptions();

    statusMessage.textContent =
        "Voices loaded successfully.";

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
// LANGUAGE CHANGE
// ======================================

languageSelect.addEventListener("change", () => {

    window.speechSynthesis.cancel();

    updateVoiceOptions();

    statusMessage.textContent =
        "Language updated. Select your voice.";

});


// ======================================
// VOICE CHANGE
// ======================================

voiceSelect.addEventListener("change", () => {

    updateSelectedVoice();

    statusMessage.textContent =
        "Voice selection updated.";

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

    if (!selectedVoice) {

        statusMessage.textContent =
            "Selected voice is not available on this device.";

        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;

    utterance.rate = Number(speedControl.value);
    utterance.pitch = Number(pitchControl.value);

    currentUtterance = utterance;

    utterance.onstart = () => {

        statusMessage.textContent =
            "Speaking...";

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

            statusMessage.textContent = "Speech resumed.";

        } else {

            window.speechSynthesis.pause();

            pauseBtn.textContent = "▶ Resume";

            statusMessage.textContent = "Speech paused.";

        }

    }

});


// ======================================
// STOP
// ======================================

stopBtn.addEventListener("click", () => {

    window.speechSynthesis.cancel();

    currentUtterance = null;

    pauseBtn.textContent = "⏸ Pause";

    statusMessage.textContent = "Speech stopped.";

});


// ======================================
// CLEAR
// ======================================

clearBtn.addEventListener("click", () => {

    window.speechSynthesis.cancel();

    textInput.value = "";

    charCount.textContent = "0 / 5000 characters";

    currentUtterance = null;

    pauseBtn.textContent = "⏸ Pause";

    statusMessage.textContent = "Text cleared.";

});


// ======================================
// INITIALIZE
// ======================================

loadVoices();

window.speechSynthesis.onvoiceschanged = loadVoices;
