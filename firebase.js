import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCD4ZnQqwRuUbDsrZ-fKTcn898VsoJoLqM",
  authDomain: "sito-kobra-kay.firebaseapp.com",
  projectId: "sito-kobra-kay",
  storageBucket: "sito-kobra-kay.firebasestorage.app",
  messagingSenderId: "840574224712",
  appId: "1:840574224712:web:a5efabae629cfe57468b7d",
  measurementId: "G-31JPYGWGL1",
};

const CHALLONGE_PUBLIC_API_KEY = "IN5466054eb0e5f2302f3ac00cc21276b4112d64b181f4ba32";
const CHALLONGE_API_KEY_PLACEHOLDER = "INCOLLA_LA_TUA_API_KEY_QUI";
const CHALLONGE_API_KEY_STORAGE = "kobra_challonge_api_key";
const CHALLONGE_API_BASE = "https://api.challonge.com/v1";
const challongeStateLabels = {
  pending: "In attesa",
  checking_in: "Check-in aperto",
  checked_in: "Check-in chiuso",
  underway: "In corso",
  awaiting_review: "In revisione",
  complete: "Concluso",
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const authTabs = document.querySelectorAll(".auth-tab");
const authPanels = document.querySelectorAll(".auth-panel");
const authGate = document.getElementById("auth-gate");
const siteShell = document.getElementById("site-shell");
const emailInput = document.getElementById("auth-email-input");
const passwordInput = document.getElementById("auth-password-input");
const googleLoginButton = document.getElementById("google-login");
const emailRegisterButton = document.getElementById("email-register");
const emailLoginButton = document.getElementById("email-login");
const authStatus = document.getElementById("auth-status");
const logoutUserButton = document.getElementById("logout-button");
const siteHeader = document.querySelector(".site-header");
const postForm = document.getElementById("post-form");
const postMessageInput = document.getElementById("post-message");
const postList = document.getElementById("post-list");
const postNote = document.getElementById("post-note");
const memberCount = document.getElementById("member-count");
const profileForm = document.getElementById("profile-form");
const profileFirstNameInput = document.getElementById("profile-first-name");
const profileLastNameInput = document.getElementById("profile-last-name");
const profileNicknameInput = document.getElementById("profile-nickname");
const profileCityInput = document.getElementById("profile-city");
const profileTournamentsInput = document.getElementById("profile-tournaments");
const profileSaveStatus = document.getElementById("profile-save-status");
const profileDisplayName = document.getElementById("profile-display-name");
const profileEmail = document.getElementById("profile-email");
const profileBelt = document.getElementById("profile-belt");
const profileXp = document.getElementById("profile-xp");
const profileTournamentsCount = document.getElementById(
  "profile-tournaments-count"
);
const memberTrainingForm = document.getElementById("member-training-form");
const memberTrainingDateInput = document.getElementById("member-training-date");
const memberTrainingTitleInput = document.getElementById("member-training-title");
const memberTrainingDescInput = document.getElementById("member-training-desc");
const memberTrainingStatus = document.getElementById("member-training-status");
const memberTrainingGrid = document.getElementById("member-training-grid");
const eventGrid = document.getElementById("event-grid");

const googleProvider = new GoogleAuthProvider();
const ADMIN_EMAILS = ["mrpinkukulele@gmail.com"];
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const isLoginPage = currentPage === "index.html" || currentPage === "login.html";
const nextPage = new URLSearchParams(window.location.search).get("next");
let unsubscribeCurrentUserProfile = null;
let unsubscribeEventRegistrations = null;
let currentUserProfile = {};
let registeredEventIds = new Set();
let activeTournamentRegistrationId = "";

const getChallongeApiKey = () => {
  const storedKey = window.localStorage.getItem(CHALLONGE_API_KEY_STORAGE) || "";
  const key = (storedKey || CHALLONGE_PUBLIC_API_KEY).trim();
  if (!key || key === CHALLONGE_API_KEY_PLACEHOLDER) {
    throw new Error(
      "Configura la API key Challonge in firebase.js prima di usare l'import automatico."
    );
  }
  return key;
};

const parseChallongeTournament = (input) => {
  const raw = String(input || "").trim();
  if (!raw) {
    throw new Error("Inserisci un link Challonge.");
  }

  try {
    const normalized = raw.startsWith("http") ? raw : `https://${raw}`;
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();

    if (!host.includes("challonge.com")) {
      throw new Error("Il link Challonge non e valido.");
    }

    const pathSlug = url.pathname.split("/").filter(Boolean)[0];
    if (!pathSlug) {
      throw new Error("Il link Challonge non e valido.");
    }

    const hostParts = host.split(".");
    const subdomain =
      hostParts.length > 2 && hostParts[0] !== "www" ? hostParts[0] : "";
    const identifier = subdomain ? `${subdomain}-${pathSlug}` : pathSlug;
    const publicUrl = subdomain
      ? `https://${subdomain}.challonge.com/${pathSlug}`
      : `https://challonge.com/${pathSlug}`;

    return { identifier, publicUrl };
  } catch (error) {
    if (raw.includes("/") || raw.includes(".")) {
      throw new Error("Il link Challonge non e valido.");
    }

    return {
      identifier: raw,
      publicUrl: `https://challonge.com/${raw}`,
    };
  }
};

const formatChallongeDate = (value) => {
  if (!value) {
    return "Data da definire";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Data da definire";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const challongeFetch = async (path, options = {}) => {
  const key = getChallongeApiKey();
  const url = new URL(`${CHALLONGE_API_BASE}/${path}`);
  url.searchParams.set("api_key", key);

  Object.entries(options.params || {}).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(name, String(value));
    }
  });

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.errors?.[0] ||
        payload?.error ||
        "Challonge ha rifiutato la richiesta."
    );
  }

  return payload;
};

const updateTournamentRegistrationUi = () => {
  if (!eventGrid) {
    return;
  }

  eventGrid.querySelectorAll("[data-register-event-id]").forEach((button) => {
    const eventId = button.dataset.registerEventId || "";
    const isRegistered = registeredEventIds.has(eventId);
    const isLoading = activeTournamentRegistrationId === eventId;

    button.disabled = isLoading || isRegistered;
    button.classList.toggle("active", isRegistered);
    button.textContent = isLoading
      ? "Iscrizione..."
      : isRegistered
        ? "Iscritto"
        : "Partecipo";
  });

  eventGrid.querySelectorAll("[data-event-status-id]").forEach((node) => {
    const eventId = node.dataset.eventStatusId || "";
    node.textContent = registeredEventIds.has(eventId)
      ? "Sei gia registrato a questo torneo."
      : "";
  });
};

const syncTournamentRegistrations = (user) => {
  unsubscribeEventRegistrations?.();
  unsubscribeEventRegistrations = null;
  registeredEventIds = new Set();
  updateTournamentRegistrationUi();

  if (!eventGrid || !user) {
    return;
  }

  const registrationsQuery = query(
    collection(db, "eventRegistrations"),
    where("uid", "==", user.uid)
  );

  unsubscribeEventRegistrations = onSnapshot(
    registrationsQuery,
    (snapshot) => {
      registeredEventIds = new Set(
        snapshot.docs
          .map((docSnap) => docSnap.data().eventId)
          .filter(Boolean)
      );
      updateTournamentRegistrationUi();
    },
    () => {
      registeredEventIds = new Set();
      updateTournamentRegistrationUi();
    }
  );
};

const setLoginFlag = (value) => {
  const flag = value ? "true" : "false";
  localStorage.setItem("myagi_logged_in", flag);
  sessionStorage.setItem("myagi_logged_in", flag);
};

const syncAdminFlag = (user) => {
  const normalizedEmail = (user?.email || "").trim().toLowerCase();
  if (ADMIN_EMAILS.includes(normalizedEmail)) {
    sessionStorage.setItem("myagi_admin_logged_in", "true");
  } else {
    sessionStorage.removeItem("myagi_admin_logged_in");
  }
  window.dispatchEvent(new CustomEvent("admin-auth-change"));
};

const getUserLabel = (user, profile = {}) => {
  if (!user) {
    return "";
  }
  const firstName = (profile.firstName || "").trim();
  const lastName = (profile.lastName || "").trim();
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim();
  }
  if (user.email && user.email.includes("@")) {
    return user.email.split("@")[0];
  }
  return user.email || user.phoneNumber || "Membro";
};

const renderHeaderUser = (user, profile = {}) => {
  if (!siteHeader) {
    return;
  }
  const existing = siteHeader.querySelector(".user-badge");
  if (!user) {
    existing?.remove();
    return;
  }
  const badge = existing || document.createElement("a");
  badge.className = "user-badge";
  badge.href = "il-mio-profilo.html";
  badge.textContent = `Profilo · ${getUserLabel(user, profile)}`;
  if (!existing) {
    siteHeader.appendChild(badge);
  }
};

const getExperienceFromTournaments = (count) =>
  Math.max(0, Number.parseInt(count || 0, 10) || 0) * 100;

const getBeltFromExperience = (experience) => {
  if (experience >= 1400) {
    return "Nera";
  }
  if (experience >= 1000) {
    return "Marrone";
  }
  if (experience >= 700) {
    return "Blu";
  }
  if (experience >= 450) {
    return "Verde";
  }
  if (experience >= 250) {
    return "Arancione";
  }
  if (experience >= 100) {
    return "Gialla";
  }
  return "Bianca";
};

const saveChallongeEvent = async (tournament, identifier, publicUrl) => {
  const participants = Array.isArray(tournament.participants)
    ? tournament.participants
    : [];
  const startsAt =
    tournament.started_at || tournament.start_at || tournament.created_at;
  const state = String(tournament.state || "").trim().toLowerCase();
  const docId = `challonge_${identifier.replace(/[^\w-]/g, "_")}`;
  const typeLabel = String(tournament.tournament_type || "")
    .replaceAll("_", " ")
    .trim();
  const description =
    stripHtml(tournament.description) ||
    (typeLabel
      ? `Bracket ${typeLabel} sincronizzato da Challonge.`
      : "Torneo sincronizzato da Challonge.");

  await setDoc(
    doc(db, "events", docId),
    {
      title: String(tournament.name || identifier).trim(),
      description,
      date: formatChallongeDate(startsAt),
      startsAt: startsAt || null,
      state,
      stateLabel: challongeStateLabels[state] || "Aggiornato da Challonge",
      tournamentType: typeLabel,
      participantCount: participants.length,
      source: "challonge",
      sourceUrl: publicUrl,
      challongeIdentifier: identifier,
      challongeSyncedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    id: docId,
    title: String(tournament.name || identifier).trim(),
    sourceUrl: publicUrl,
    participantCount: participants.length,
    stateLabel: challongeStateLabels[state] || "Aggiornato da Challonge",
  };
};

window.kobraKayImportTournament = async (challongeUrl) => {
  const { identifier, publicUrl } = parseChallongeTournament(challongeUrl);
  const payload = await challongeFetch(
    `tournaments/${encodeURIComponent(identifier)}.json`,
    {
      params: {
        include_participants: 1,
      },
    }
  );
  const tournament = payload?.tournament;
  if (!tournament) {
    throw new Error("Il torneo Challonge non contiene dati utilizzabili.");
  }
  return saveChallongeEvent(tournament, identifier, publicUrl);
};

const registerCurrentUserForEvent = async (eventId, user) => {
  const registrationRef = doc(db, "eventRegistrations", `${eventId}_${user.uid}`);
  const eventRef = doc(db, "events", eventId);
  const userRef = doc(db, "users", user.uid);

  const [registrationSnap, eventSnap, userSnap] = await Promise.all([
    getDoc(registrationRef),
    getDoc(eventRef),
    getDoc(userRef),
  ]);

  if (registrationSnap.exists()) {
    return { alreadyRegistered: true };
  }

  if (!eventSnap.exists()) {
    throw new Error("Torneo non trovato.");
  }

  const eventData = eventSnap.data() || {};
  if (eventData.source !== "challonge" || !eventData.challongeIdentifier) {
    throw new Error("Questo torneo non e collegato a Challonge.");
  }

  const profile = userSnap.exists() ? userSnap.data() : {};
  const participantName = getUserLabel(user, profile);
  const participantEmail = String(user.email || profile.email || "").trim();

  if (!participantEmail) {
    throw new Error("Per registrarti serve una mail valida sul profilo.");
  }

  const identifier = String(eventData.challongeIdentifier).trim();
  const participantsPayload = await challongeFetch(
    `tournaments/${encodeURIComponent(identifier)}/participants.json`
  );
  const participants = Array.isArray(participantsPayload)
    ? participantsPayload
    : [];
  const existingParticipant = participants
    .map((entry) => entry.participant || {})
    .find(
      (participant) =>
        String(participant.misc || "").trim() === user.uid ||
        String(participant.email || "").trim().toLowerCase() ===
          participantEmail.toLowerCase()
    );

  let participantId = existingParticipant?.id || null;
  let createdOnChallonge = false;

  if (!existingParticipant) {
    const body = new URLSearchParams();
    body.set("participant[name]", participantName);
    body.set("participant[email]", participantEmail);
    body.set("participant[misc]", user.uid);

    const createdPayload = await challongeFetch(
      `tournaments/${encodeURIComponent(identifier)}/participants.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    participantId = createdPayload?.participant?.id || null;
    createdOnChallonge = true;
  }

  await setDoc(
    registrationRef,
    {
      uid: user.uid,
      eventId,
      eventTitle: String(eventData.title || "").trim(),
      source: "challonge",
      challongeIdentifier: identifier,
      challongeParticipantId: participantId,
      participantName,
      participantEmail,
      createdAt: serverTimestamp(),
      syncedFromChallonge: !createdOnChallonge,
    },
    { merge: true }
  );

  if (createdOnChallonge) {
    const currentTournamentsPlayed =
      Number.parseInt(profile.tournamentsPlayed || 0, 10) || 0;
    const nextTournamentsPlayed = currentTournamentsPlayed + 1;
    const nextExperience = getExperienceFromTournaments(nextTournamentsPlayed);
    const nextBelt = getBeltFromExperience(nextExperience);

    await setDoc(
      userRef,
      {
        tournamentsPlayed: nextTournamentsPlayed,
        experiencePoints: nextExperience,
        currentBelt: nextBelt,
      },
      { merge: true }
    );

    await updateDoc(eventRef, {
      participantCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    return {
      registered: true,
      participantId,
      tournamentsPlayed: nextTournamentsPlayed,
      experiencePoints: nextExperience,
      currentBelt: nextBelt,
    };
  }

  return {
    alreadyRegistered: true,
    participantId,
  };
};

const populateProfileForm = (profile = {}) => {
  if (!profileForm) {
    return;
  }
  profileFirstNameInput.value = profile.firstName || "";
  profileLastNameInput.value = profile.lastName || "";
  profileNicknameInput.value = profile.nickname || "";
  profileCityInput.value = profile.city || "";
  profileTournamentsInput.value = profile.tournamentsPlayed || 0;
};

const renderProfileSummary = (user, profile = {}) => {
  if (!profileDisplayName) {
    return;
  }
  const tournamentsPlayed =
    Number.parseInt(profile.tournamentsPlayed || 0, 10) || 0;
  const experiencePoints =
    Number.parseInt(profile.experiencePoints || 0, 10) ||
    getExperienceFromTournaments(tournamentsPlayed);
  const currentBelt = profile.currentBelt || getBeltFromExperience(experiencePoints);

  profileDisplayName.textContent = getUserLabel(user, profile) || "Membro Kobra Kay";
  profileEmail.textContent = user?.email || "-";
  profileBelt.textContent = currentBelt;
  profileXp.textContent = `${experiencePoints} XP`;
  profileTournamentsCount.textContent = `${tournamentsPlayed}`;
};

const renderMemberTrainings = (trainings = []) => {
  if (!memberTrainingGrid) {
    return;
  }

  if (!trainings.length) {
    memberTrainingGrid.innerHTML =
      '<div class="creator-results"><p class="muted">Nessun allenamento proposto per ora.</p></div>';
    return;
  }

  const currentUid = auth.currentUser?.uid || "";
  memberTrainingGrid.innerHTML = trainings
    .map((training) => {
      const participantIds = Array.isArray(training.participantIds)
        ? training.participantIds
        : [];
      const isJoined = currentUid && participantIds.includes(currentUid);
      const participantCount = participantIds.length;

      return `
        <article class="event-card">
          <div>
            <p class="event-date">${training.date || ""}</p>
            <h2>${training.title || ""}</h2>
            <p>${training.description || ""}</p>
            <p class="training-meta">Proposto da ${training.createdByName || "Membro Kobra Kay"}</p>
            <p class="training-meta">Partecipanti: ${participantCount}</p>
          </div>
          <button class="cta ${isJoined ? "active" : ""}" type="button" data-training-id="${training.id}">
            ${isJoined ? "Partecipo gia" : "Partecipo"}
          </button>
        </article>
      `;
    })
    .join("");

  memberTrainingGrid
    .querySelectorAll("button[data-training-id]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) {
          return;
        }
        const trainingId = button.dataset.trainingId;
        const isJoined = button.classList.contains("active");
        try {
          await updateDoc(doc(db, "trainings", trainingId), {
            participantIds: isJoined
              ? arrayRemove(user.uid)
              : arrayUnion(user.uid),
          });
        } catch (error) {
          alert(
            error?.code === "permission-denied"
              ? "Non hai i permessi Firestore per partecipare a questo allenamento."
              : "Errore durante l'aggiornamento della partecipazione."
          );
        }
      });
    });
};

const setAuthStatus = (text, loggedIn) => {
  if (authStatus) {
    const statusText = authStatus.querySelector("p");
    if (statusText) {
      statusText.textContent = text;
    }
  }
  if (logoutUserButton) {
    logoutUserButton.hidden = !loggedIn;
  }
  if (postForm) {
    postForm.querySelectorAll("input, textarea, button").forEach((field) => {
      field.disabled = !loggedIn;
    });
  }
  if (postNote) {
    postNote.textContent = loggedIn
      ? "Sei loggato: puoi pubblicare."
      : "Devi essere loggato per pubblicare.";
  }
};

const lockSite = () => {
  if (authGate) {
    authGate.hidden = false;
  }
  if (siteShell) {
    siteShell.hidden = true;
  }
  if (document.body.dataset.protected === "true") {
    document.body.classList.remove("auth-ready");
  }
};

const unlockSite = () => {
  if (authGate) {
    authGate.hidden = true;
  }
  if (siteShell) {
    siteShell.hidden = false;
  }
  if (document.body.dataset.protected === "true") {
    document.body.classList.add("auth-ready");
  }
};

const redirectToLogin = () => {
  if (isLoginPage) {
    lockSite();
    return;
  }
  const destination =
    currentPage && currentPage !== "index.html"
      ? `index.html?next=${encodeURIComponent(currentPage)}`
      : "index.html";
  window.location.replace(destination);
};

const ensureUserDoc = async (user, extra = {}) => {
  if (!user) {
    return;
  }
  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email || null,
      phone: user.phoneNumber || null,
      displayName: user.displayName || null,
      createdAt: serverTimestamp(),
      ...extra,
    },
    { merge: true }
  );
};

if (authTabs.length) {
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((btn) => btn.classList.remove("active"));
      authPanels.forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      const target = document.getElementById(`auth-${tab.dataset.tab}`);
      if (target) {
        target.classList.add("active");
      }
    });
  });
}

if (googleLoginButton) {
  googleLoginButton.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(result.user);
      setLoginFlag(true);
    } catch (error) {
      alert("Accesso Google fallito: " + error.message);
    }
  });
}

if (emailRegisterButton && emailInput && passwordInput) {
  emailRegisterButton.addEventListener("click", async () => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        emailInput.value.trim(),
        passwordInput.value.trim()
      );
      await ensureUserDoc(result.user);
      setLoginFlag(true);
    } catch (error) {
      alert("Registrazione fallita: " + error.message);
    }
  });
}

if (emailLoginButton && emailInput && passwordInput) {
  emailLoginButton.addEventListener("click", async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        emailInput.value.trim(),
        passwordInput.value.trim()
      );
      setLoginFlag(true);
    } catch (error) {
      alert("Login fallito: " + error.message);
    }
  });
}

if (logoutUserButton) {
  logoutUserButton.addEventListener("click", async () => {
    await signOut(auth);
    setLoginFlag(false);
  });
}

if (
  profileForm &&
  profileFirstNameInput &&
  profileLastNameInput &&
  profileNicknameInput &&
  profileCityInput &&
  profileTournamentsInput
) {
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const tournamentsPlayed =
      Number.parseInt(profileTournamentsInput.value || 0, 10) || 0;
    const experiencePoints = getExperienceFromTournaments(tournamentsPlayed);
    const currentBelt = getBeltFromExperience(experiencePoints);

    await setDoc(
      doc(db, "users", user.uid),
      {
        firstName: profileFirstNameInput.value.trim(),
        lastName: profileLastNameInput.value.trim(),
        nickname: profileNicknameInput.value.trim(),
        city: profileCityInput.value.trim(),
        tournamentsPlayed,
        experiencePoints,
        currentBelt,
      },
      { merge: true }
    );

    if (profileSaveStatus) {
      profileSaveStatus.textContent = "Profilo aggiornato.";
    }
  });
}

if (
  memberTrainingForm &&
  memberTrainingDateInput &&
  memberTrainingTitleInput &&
  memberTrainingDescInput
) {
  memberTrainingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      await addDoc(collection(db, "trainings"), {
        date: memberTrainingDateInput.value.trim(),
        title: memberTrainingTitleInput.value.trim(),
        description: memberTrainingDescInput.value.trim(),
        createdByUid: user.uid,
        createdByName: getUserLabel(user, currentUserProfile),
        participantIds: [user.uid],
        createdAt: serverTimestamp(),
      });

      memberTrainingForm.reset();
      if (memberTrainingStatus) {
        memberTrainingStatus.textContent =
          "Allenamento proposto con successo.";
      }
    } catch (error) {
      if (memberTrainingStatus) {
        memberTrainingStatus.textContent =
          error?.code === "permission-denied"
            ? "Firestore sta bloccando la creazione dell'allenamento. Devi aggiornare le regole."
            : "Errore durante la creazione dell'allenamento.";
      }
    }
  });
}

if (postForm && postList && postMessageInput) {
  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = postMessageInput.value.trim();
    if (!message) {
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      alert("Devi essere loggato per pubblicare.");
      return;
    }
    const author =
      getUserLabel(user, currentUserProfile) || "Blader";
    await addDoc(collection(db, "posts"), {
      author,
      message,
      createdAt: serverTimestamp(),
      uid: user.uid,
    });
    postMessageInput.value = "";
  });

  const postsQuery = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc")
  );
  onSnapshot(postsQuery, (snapshot) => {
    postList.innerHTML = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        const date = data.createdAt?.toDate
          ? data.createdAt.toDate().toLocaleString("it-IT")
          : "Adesso";
        return `
          <div class="board-item">
            <div class="author">${data.author || "Blader"}</div>
            <div>${data.message || ""}</div>
            <div class="date">${date}</div>
          </div>
        `;
      })
      .join("");
  });
}

if (memberCount) {
  const usersQuery = collection(db, "users");
  onSnapshot(usersQuery, (snapshot) => {
    memberCount.textContent = `Membri registrati: ${snapshot.size}`;
  });
}

if (memberTrainingGrid) {
  const trainingsQuery = query(
    collection(db, "trainings"),
    orderBy("createdAt", "desc")
  );
  onSnapshot(
    trainingsQuery,
    (snapshot) => {
      const trainings = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      renderMemberTrainings(trainings);
    },
    () => {
      renderMemberTrainings([]);
    }
  );
}

if (eventGrid) {
  eventGrid.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-register-event-id]");
    if (!button) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Devi essere loggato per partecipare ai tornei.");
      return;
    }

    const eventId = button.dataset.registerEventId || "";
    if (!eventId || registeredEventIds.has(eventId) || activeTournamentRegistrationId) {
      return;
    }

    activeTournamentRegistrationId = eventId;
    updateTournamentRegistrationUi();

    try {
      const result = await registerCurrentUserForEvent(eventId, user);

      if (result.registered || result.alreadyRegistered) {
        registeredEventIds = new Set([...registeredEventIds, eventId]);
      }

      updateTournamentRegistrationUi();

      const statusNode = eventGrid.querySelector(
        `[data-event-status-id="${CSS.escape(eventId)}"]`
      );
      if (statusNode) {
        statusNode.textContent = result.alreadyRegistered
          ? "Risulti gia registrato su Challonge."
          : "Registrazione completata su Challonge.";
      }
    } catch (error) {
      const statusNode = eventGrid.querySelector(
        `[data-event-status-id="${CSS.escape(eventId)}"]`
      );
      if (statusNode) {
        statusNode.textContent =
          error?.message || "Registrazione al torneo non riuscita.";
      }
      alert(
        error?.message || "Registrazione al torneo non riuscita."
      );
    } finally {
      activeTournamentRegistrationId = "";
      updateTournamentRegistrationUi();
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await ensureUserDoc(user);
    unsubscribeCurrentUserProfile?.();
    unsubscribeCurrentUserProfile = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        const profile = snapshot.exists() ? snapshot.data() : {};
        currentUserProfile = profile;
        renderHeaderUser(user, profile);
        populateProfileForm(profile);
        renderProfileSummary(user, profile);
      }
    );
    const label = user.email || user.phoneNumber || "utente";
    setAuthStatus(`Stato: loggato (${label}).`, true);
    setLoginFlag(true);
    syncAdminFlag(user);
    syncTournamentRegistrations(user);
    unlockSite();
    if (isLoginPage) {
      const destination =
        nextPage && nextPage !== "index.html" ? nextPage : "home.html";
      window.location.replace(destination);
      return;
    }
  } else {
    unsubscribeCurrentUserProfile?.();
    unsubscribeCurrentUserProfile = null;
    unsubscribeEventRegistrations?.();
    unsubscribeEventRegistrations = null;
    currentUserProfile = {};
    registeredEventIds = new Set();
    activeTournamentRegistrationId = "";
    setAuthStatus("Stato: non autenticato.", false);
    setLoginFlag(false);
    syncAdminFlag(null);
    renderHeaderUser(null);
    updateTournamentRegistrationUi();
    redirectToLogin();
  }
});
