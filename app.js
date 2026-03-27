const defaultEvents = [
  {
    date: "12 Aprile 2024 · Ravenna",
    title: "Romagna Spin Clash",
    description:
      "Open battle con bracket a doppia eliminazione e finalissima al meglio di 5.",
  },
  {
    date: "4 Maggio 2024 · Faenza",
    title: "Faenza Speed Cup",
    description:
      "Torneo dedicato agli attacchi rapidi con sessione di coaching pre-match.",
  },
  {
    date: "22 Giugno 2024 · Cesena",
    title: "Cesena Night Arena",
    description: "Evento serale con luci sceniche, dj set e sfide a squadre.",
  },
];

const defaultTrainings = [];

const defaultTrophies = [
  {
    title: "1 posto · Spin Clash 2023",
    name: "Marco R. · Combo stamina \"North Wind\"",
    description: "Finale vinta 3-1 con recovery perfetta in semifinale.",
  },
  {
    title: "2 posto · Faenza Speed Cup",
    name: "Chiara L. · Setup attacco \"Crimson Rush\"",
    description: "Serie di 5 KO consecutivi nelle fasi a gironi.",
  },
  {
    title: "3 posto · Forli Team Battle",
    name: "Squadra Kobra Kay Bleyblade X Junior",
    description: "Sinergia perfetta nel round di coppia con ring out decisivo.",
  },
  {
    title: "Menzione speciale · Cesena Night Arena",
    name: "Elia D. · Difesa \"Iron Dome\"",
    description:
      "Top 4 con il minor numero di touchout subiti del torneo.",
  },
];

const STORAGE = {
  adminPassword: "myagi_admin_password",
};

const firebaseConfig = {
  apiKey: "AIzaSyCD4ZnQqwRuUbDsrZ-fKTcn898VsoJoLqM",
  authDomain: "sito-kobra-kay.firebaseapp.com",
  projectId: "sito-kobra-kay",
  storageBucket: "sito-kobra-kay.firebasestorage.app",
  messagingSenderId: "840574224712",
  appId: "1:840574224712:web:a5efabae629cfe57468b7d",
  measurementId: "G-31JPYGWGL1",
};

let firestore = null;
let firebaseReady = false;
let firebaseLoading = false;

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const initFirestore = () => {
  if (firebaseReady) {
    return true;
  }
  if (window.firebase && window.firebase.apps) {
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }
    firestore = window.firebase.firestore();
    firebaseReady = true;
    localStorage.removeItem("myagi_events");
    localStorage.removeItem("myagi_trainings");
    localStorage.removeItem("myagi_trophies");
    return true;
  }
  return false;
};

const loadScript = (src, onLoad) => {
  const script = document.createElement("script");
  script.src = src;
  script.onload = onLoad;
  script.onerror = onLoad;
  document.head.appendChild(script);
};

const ensureFirestore = (onReady) => {
  if (initFirestore()) {
    onReady();
    return;
  }
  if (firebaseLoading) {
    return;
  }
  firebaseLoading = true;
  loadScript(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
    () => {
      loadScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",
        () => {
          firebaseLoading = false;
          if (initFirestore()) {
            onReady();
          }
        }
      );
    }
  );
};

const seedCollectionOnce = async (name, defaults) => {
  if (!firestore) {
    return;
  }
  try {
    const metaRef = firestore.collection("meta").doc("seed");
    const metaSnap = await metaRef.get();
    const meta = metaSnap.exists ? metaSnap.data() : {};
    if (meta && meta[name]) {
      return;
    }
    const batch = firestore.batch();
    defaults.forEach((item, index) => {
      const ref = firestore.collection(name).doc(`default-${index + 1}`);
      batch.set(ref, {
        ...item,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    batch.set(metaRef, { ...meta, [name]: true }, { merge: true });
    await batch.commit();
  } catch (error) {
    if (error?.code !== "permission-denied") {
      throw error;
    }
  }
};

const subscribeCollection = (name, onData) => {
  if (!firestore) {
    onData([]);
    return;
  }
  firestore
    .collection(name)
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        onData(items);
      },
      () => {
        onData([]);
      }
    );
};

const isAdminLoggedIn = () =>
  sessionStorage.getItem("myagi_admin_logged_in") === "true";

const renderEvents = () => {
  const grid = document.getElementById("event-grid");
  if (!grid) {
    return;
  }
  if (!firestore) {
    grid.innerHTML =
      '<div class="creator-results"><p class="muted">Caricamento eventi...</p></div>';
    ensureFirestore(renderEvents);
    return;
  }
  seedCollectionOnce("events", defaultEvents);
  subscribeCollection("events", (events) => {
    if (!events.length) {
      grid.innerHTML =
        '<div class="creator-results"><p class="muted">Nessun evento disponibile.</p></div>';
      return;
    }
    grid.innerHTML = events
      .map((event) => {
        const title = escapeHtml(event.title);
        const date = escapeHtml(event.date);
        const description = escapeHtml(event.description);
        const stateLabel = escapeHtml(event.stateLabel);
        const participantCount = Number.isFinite(event.participantCount)
          ? `${event.participantCount} partecipanti`
          : "";
        const typeLabel = escapeHtml(event.tournamentType);
        const sourceUrl = escapeHtml(event.sourceUrl);
        const meta = [stateLabel, participantCount, typeLabel].filter(Boolean);

        return `
          <article class="event-card">
            <div>
              <p class="event-date">${date}</p>
              <h2>${title}</h2>
              <p>${description}</p>
              ${
                meta.length
                  ? `<p class="event-meta">${meta.join(" · ")}</p>`
                  : ""
              }
            </div>
            <div class="event-actions">
              ${
                event.source === "challonge"
                  ? `<button class="cta" type="button" data-register-event-id="${escapeHtml(
                      event.id
                    )}">Partecipo</button>`
                  : `<button class="cta" data-event="${title}">Segui torneo</button>`
              }
              ${
                sourceUrl
                  ? `<a class="cta ghost" href="${sourceUrl}" target="_blank" rel="noreferrer">Apri su Challonge</a>`
                  : ""
              }
            </div>
            <p class="event-register-status" data-event-status-id="${escapeHtml(
              event.id
            )}"></p>
          </article>
        `
      })
      .join("");

    const eventButtons = grid.querySelectorAll(".cta[data-event]");
    eventButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const active = button.classList.toggle("active");
        button.textContent = active ? "Partecipo!" : "Partecipo";
      });
    });
  });
};

const renderTrainings = () => {
  const grid = document.getElementById("training-grid");
  if (!grid) {
    return;
  }
  if (!firestore) {
    grid.innerHTML =
      '<div class="creator-results"><p class="muted">Caricamento allenamenti...</p></div>';
    ensureFirestore(renderTrainings);
    return;
  }
  seedCollectionOnce("trainings", defaultTrainings);
  subscribeCollection("trainings", (trainings) => {
    if (!trainings.length) {
      grid.innerHTML =
        '<div class="creator-results"><p class="muted">Nessun allenamento disponibile.</p></div>';
      return;
    }
    grid.innerHTML = trainings
      .map(
        (training) => `
          <article class="event-card">
            <div>
              <p class="event-date">${training.date || ""}</p>
              <h2>${training.title || ""}</h2>
              <p>${training.description || ""}</p>
            </div>
          </article>
        `
      )
      .join("");
  });
};

const renderTrophies = () => {
  const grid = document.getElementById("trophy-grid");
  if (!grid) {
    return;
  }
  if (!firestore) {
    grid.innerHTML =
      '<div class="creator-results"><p class="muted">Caricamento trofei...</p></div>';
    ensureFirestore(renderTrophies);
    return;
  }
  subscribeCollection("trophies", (trophies) => {
    if (!trophies.length) {
      grid.innerHTML =
        '<div class="creator-results"><p class="muted">Nessun trofeo disponibile.</p></div>';
      return;
    }
    grid.innerHTML = trophies
      .map(
        (trophy) => `
          <article class="trophy-card">
            <h2>${trophy.title || ""}</h2>
            <p class="trophy-name">${trophy.name || ""}</p>
            <p>${trophy.description || ""}</p>
          </article>
        `
      )
      .join("");
  });
};

renderEvents();
renderTrainings();
renderTrophies();

const REFEREE_LEVELS = [
  "in-formazione",
  "assistente-arbitro",
  "arbitro-club",
  "capo-arbitro",
];

const formatRefereeLevel = (level) => {
  if (!level) {
    return "";
  }
  return level
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const renderReferees = () => {
  const refereeList = document.getElementById("referee-list");
  if (!refereeList) {
    return;
  }
  if (!firestore) {
    refereeList.innerHTML =
      '<div class="creator-results"><p class="muted">Caricamento patentini arbitro...</p></div>';
    ensureFirestore(renderReferees);
    return;
  }
  const refereeFilters = document.querySelectorAll(".referee-filter");
  const refereeEmpty = document.getElementById("referee-empty");
  const refereeOrder = Object.fromEntries(
    REFEREE_LEVELS.map((level, index) => [level, index])
  );
  let activeLicense = "tutti";

  const applyRefereeFilter = (licenseLevel) => {
    const items = refereeList.querySelectorAll(".referee-item");
    items.forEach((item) => {
      const matches =
        licenseLevel === "tutti" || item.dataset.license === licenseLevel;
      item.hidden = !matches;
    });
  };

  if (refereeFilters.length) {
    refereeFilters.forEach((button) => {
      button.addEventListener("click", () => {
        refereeFilters.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        activeLicense = button.dataset.license || "tutti";
        applyRefereeFilter(activeLicense);
      });
    });
  }

  subscribeCollection("refereeLicenses", (referees) => {
    const sorted = [...referees].sort((a, b) => {
      const aLevel = (a.licenseLevel || "").toLowerCase();
      const bLevel = (b.licenseLevel || "").toLowerCase();
      const orderDiff =
        (refereeOrder[aLevel] ?? 99) - (refereeOrder[bLevel] ?? 99);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return (a.name || "").localeCompare(b.name || "", "it");
    });
    refereeList.innerHTML = sorted
      .map(
        (member) => `
          <div class="referee-item" data-license="${(member.licenseLevel || "").toLowerCase()}">
            <span>${member.name || ""}</span>
            <span class="referee-badge">${formatRefereeLevel(member.licenseLevel || "")}</span>
          </div>
        `
      )
      .join("");
    if (refereeEmpty) {
      refereeEmpty.hidden = sorted.length > 0;
    }
    applyRefereeFilter(activeLicense);
  });
};

renderReferees();

const renderAdminLists = () => {
  const refereeList = document.querySelector("#referee-list-admin .admin-list");
  const eventList = document.querySelector("#event-list .admin-list");
  const trainingList = document.querySelector("#training-list .admin-list");
  const trophyList = document.querySelector("#trophy-list .admin-list");
  if (!eventList || !trainingList || !trophyList) {
    return;
  }
  if (!firestore) {
    ensureFirestore(renderAdminLists);
    return;
  }
  const renderAdminCollection = (name, listEl, labelBuilder) => {
    if (!listEl) {
      return;
    }
    subscribeCollection(name, (items) => {
      listEl.innerHTML = items
        .map(
          (item) => `
            <div class="admin-item">
              <span>${labelBuilder ? labelBuilder(item) : item.title || ""}</span>
              <button type="button" data-doc-id="${item.id}">Elimina</button>
            </div>
          `
        )
        .join("");

      listEl.querySelectorAll("button[data-doc-id]").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!isAdminLoggedIn()) {
            alert("Devi fare login admin per eliminare.");
            return;
          }
          const docId = button.dataset.docId;
          await firestore.collection(name).doc(docId).delete();
        });
      });
    });
  };

  const renderAdminReferees = () => {
    if (!refereeList) {
      return;
    }
    subscribeCollection("refereeLicenses", (items) => {
      refereeList.innerHTML = items
        .map(
          (item) => `
            <div class="admin-item">
              <span>${item.name || ""} · ${formatRefereeLevel(item.licenseLevel || "")}</span>
              <div class="admin-actions">
                <button type="button" class="admin-edit" data-doc-id="${item.id}">Modifica</button>
                <button type="button" data-doc-id="${item.id}">Elimina</button>
              </div>
            </div>
          `
        )
        .join("");

      refereeList.querySelectorAll("button[data-doc-id]").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!isAdminLoggedIn()) {
            alert("Devi fare login admin per eliminare.");
            return;
          }
          const docId = button.dataset.docId;
          await firestore.collection("refereeLicenses").doc(docId).delete();
        });
      });

      refereeList.querySelectorAll(".admin-edit").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!isAdminLoggedIn()) {
            alert("Devi fare login admin per modificare i patentini arbitro.");
            return;
          }
          const docId = button.dataset.docId;
          const current = items.find((item) => item.id === docId);
          if (!current) {
            return;
          }
          const newName = prompt("Nome arbitro:", current.name || "");
          if (!newName) {
            return;
          }
          const newLevel = prompt(
            "Livello patentino (in-formazione, assistente-arbitro, arbitro-club, capo-arbitro):",
            (current.licenseLevel || "").toLowerCase()
          );
          if (!newLevel) {
            return;
          }
          const normalized = newLevel.trim().toLowerCase();
          if (!REFEREE_LEVELS.includes(normalized)) {
            alert("Livello patentino non valido.");
            return;
          }
          await firestore.collection("refereeLicenses").doc(docId).update({
            name: newName.trim(),
            licenseLevel: normalized,
          });
        });
      });
    });
  };

  renderAdminCollection("events", eventList);
  renderAdminCollection("trainings", trainingList);
  renderAdminCollection("trophies", trophyList);
  renderAdminReferees();
};

renderAdminLists();

const products = [
  {
    name: "Iron Man & Thanos (Dual Pack)",
    beys: [
      { blade: "Iron Man", ratchet: "4-80", bit: "B" },
      { blade: "Thanos", ratchet: "4-60", bit: "P" },
    ],
  },
  {
    name: "Spider-Man & Venom (Dual Pack)",
    beys: [
      { blade: "Spider-Man", ratchet: "3-60", bit: "F" },
      { blade: "Venom", ratchet: "3-80", bit: "N" },
    ],
  },
  {
    name: "Optimus Prime & Megatron (Dual Pack)",
    beys: [
      { blade: "Optimus Prime", ratchet: "4-60", bit: "P" },
      { blade: "Megatron", ratchet: "4-80", bit: "B" },
    ],
  },
  {
    name: "Optimus Primal & Starscream (Dual Pack)",
    beys: [
      { blade: "Optimus Primal", ratchet: "3-60", bit: "F" },
      { blade: "Starscream", ratchet: "3-80", bit: "N" },
    ],
  },
  {
    name: "Mandolorian & Moff Gideon (Dual Pack)",
    beys: [
      { blade: "Mandolorian", ratchet: "3-80", bit: "F" },
      { blade: "Moff Gideon", ratchet: "3-80", bit: "N" },
    ],
  },
  {
    name: "Luke Skywalker & Darth Vader (Dual Pack)",
    beys: [
      { blade: "Luke Skywalker", ratchet: "4-80", bit: "B" },
      { blade: "Darth Vader", ratchet: "4-60", bit: "P" },
    ],
  },
  {
    name: "T-Rex & Mosasaurus (Dual Pack)",
    beys: [
      { blade: "T-Rex", ratchet: "1-80", bit: "GB" },
      { blade: "Mosasaurus", ratchet: "9-60", bit: "U" },
    ],
  },
  {
    name: "Spinosaurus & Quetzalcoatlus (Dual Pack)",
    beys: [
      { blade: "Spinosaurus", ratchet: "1-85", bit: "A" },
      { blade: "Quetzalcoatlus", ratchet: "4-55", bit: "D" },
    ],
  },
  {
    name: "X-Streme Stadium Starter Set",
    beys: [
      { blade: "Dagger Dran", ratchet: "4-60", bit: "R" },
      { blade: "Tusk Mammoth", ratchet: "3-60", bit: "T" },
    ],
  },
  {
    name: "Sword Dran (3-60F)",
    beys: [{ blade: "Sword Dran", ratchet: "3-60", bit: "F" }],
  },
  {
    name: "Helm Knight (3-80N)",
    beys: [{ blade: "Helm Knight", ratchet: "3-80", bit: "N" }],
  },
  {
    name: "Arrow Wizard (4-80B)",
    beys: [{ blade: "Arrow Wizard", ratchet: "4-80", bit: "B" }],
  },
  {
    name: "Scythe Incendio (4-60T)",
    beys: [{ blade: "Scythe Incendio", ratchet: "4-60", bit: "T" }],
  },
  {
    name: "Steel Samurai (4-80T)",
    beys: [{ blade: "Steel Samurai", ratchet: "4-80", bit: "T" }],
  },
  {
    name: "Horn Rhino (3-80S)",
    beys: [{ blade: "Horn Rhino", ratchet: "3-80", bit: "S" }],
  },
  {
    name: "Keel Shark (3-60LF)",
    beys: [{ blade: "Keel Shark", ratchet: "3-60", bit: "LF" }],
  },
  {
    name: "Talon Ptera (3-80B)",
    beys: [{ blade: "Talon Ptera", ratchet: "3-80", bit: "B" }],
  },
  {
    name: "Knife Shinobi & Keel Shark (Dual Pack)",
    beys: [
      { blade: "Knife Shinobi", ratchet: "4-80", bit: "HN" },
      { blade: "Keel Shark", ratchet: "3-80", bit: "F" },
    ],
  },
  {
    name: "Chain Incendio & Arrow Wizard (Dual Pack)",
    beys: [
      { blade: "Chain Incendio", ratchet: "5-60", bit: "HT" },
      { blade: "Arrow Wizard", ratchet: "4-60", bit: "N" },
    ],
  },
  {
    name: "Tail Viper & Sword Dran (Dual Pack)",
    beys: [
      { blade: "Tail Viper", ratchet: "5-80", bit: "O" },
      { blade: "Sword Dran", ratchet: "3-60", bit: "F" },
    ],
  },
  {
    name: "Soar Phoenix (String Launcher Set)",
    beys: [{ blade: "Soar Phoenix", ratchet: "9-60", bit: "GF" }],
  },
  {
    name: "Dranzer Spiral (Europa)",
    beys: [{ blade: "Dranzer Spiral", ratchet: "3-80", bit: "T" }],
  },
  {
    name: "Dranzer Spiral (USA/Australia)",
    beys: [{ blade: "Dranzer Spiral", ratchet: "3-80", bit: "T" }],
  },
  {
    name: "Lance Knight (4-80HN)",
    beys: [{ blade: "Lance Knight", ratchet: "4-80", bit: "HN" }],
  },
  {
    name: "Claw Leon (5-60P)",
    beys: [{ blade: "Claw Leon", ratchet: "5-60", bit: "P" }],
  },
  {
    name: "Sting Unicorn (5-60?)",
    beys: [{ blade: "Sting Unicorn", ratchet: "5-60", bit: "?" }],
  },
  {
    name: "Roar Tyranno (9-60GF)",
    beys: [{ blade: "Roar Tyranno", ratchet: "9-60", bit: "GF" }],
  },
  {
    name: "Scythe Incendio (3-80B)",
    beys: [{ blade: "Scythe Incendio", ratchet: "3-80", bit: "B" }],
  },
  {
    name: "Savage Bear (3-60S)",
    beys: [{ blade: "Savage Bear", ratchet: "3-60", bit: "S" }],
  },
  {
    name: "Yell Kong & Helm Knight (Dual Pack)",
    beys: [
      { blade: "Yell Kong", ratchet: "3-60", bit: "GB" },
      { blade: "Helm Knight", ratchet: "5-80", bit: "T" },
    ],
  },
  {
    name: "Bite Croc & Sting Unicorn (Dual Pack)",
    beys: [
      { blade: "Bite Croc", ratchet: "3-60", bit: "LF" },
      { blade: "Sting Unicorn", ratchet: "4-60", bit: "P" },
    ],
  },
  {
    name: "Gale Wyvern & Tail Viper (Dual Pack)",
    beys: [
      { blade: "Gale Wyvern", ratchet: "5-80", bit: "GB" },
      { blade: "Tail Viper", ratchet: "3-80", bit: "HN" },
    ],
  },
  {
    name: "Buster Dran UX (1-60A)",
    beys: [{ blade: "Buster Dran UX", ratchet: "1-60", bit: "A" }],
  },
  {
    name: "Wand Wizard UX (5-70DB)",
    beys: [{ blade: "Wand Wizard UX", ratchet: "5-70", bit: "DB" }],
  },
  {
    name: "Cowl Sphinx (9-80GN)",
    beys: [{ blade: "Cowl Sphinx", ratchet: "9-80", bit: "GN" }],
  },
  {
    name: "Arrow Wizard (4-80GB)",
    beys: [{ blade: "Arrow Wizard", ratchet: "4-80", bit: "GB" }],
  },
  {
    name: "Beat Tyranno & Knife Shinobi (Dual Pack)",
    beys: [
      { blade: "Beat Tyranno", ratchet: "4-70", bit: "Q" },
      { blade: "Knife Shinobi", ratchet: "4-80", bit: "HN" },
    ],
  },
  {
    name: "Gale Wyvern & Sword Dran (Dual Pack)",
    beys: [
      { blade: "Gale Wyvern", ratchet: "3-60", bit: "T" },
      { blade: "Sword Dran", ratchet: "3-80", bit: "B" },
    ],
  },
  {
    name: "Drop Attack Stadium Set",
    beys: [
      { blade: "Impact Drake", ratchet: "9-60", bit: "LF" },
      { blade: "Hover Wyvern", ratchet: "3-85", bit: "HN" },
    ],
  },
  {
    name: "Cobalt Dragoon (Starter Pack)",
    beys: [{ blade: "Cobalt Dragoon", ratchet: "2-60", bit: "C" }],
  },
  {
    name: "Buster Dran UX (5-70DB)",
    beys: [{ blade: "Buster Dran UX", ratchet: "5-70", bit: "DB" }],
  },
  {
    name: "Wand Wizard UX (1-60R)",
    beys: [{ blade: "Wand Wizard UX", ratchet: "1-60", bit: "R" }],
  },
  {
    name: "Hammer Incendio UX (3-70H)",
    beys: [{ blade: "Hammer Incendio UX", ratchet: "3-70", bit: "H" }],
  },
  {
    name: "Sterling Wolf UX (3-80FB)",
    beys: [{ blade: "Sterling Wolf UX", ratchet: "3-80", bit: "FB" }],
  },
  {
    name: "Shadow Shinobi UX (1-80MN)",
    beys: [{ blade: "Shadow Shinobi UX", ratchet: "1-80", bit: "MN" }],
  },
  {
    name: "Obsidian Shell (4-60D)",
    beys: [{ blade: "Obsidian Shell", ratchet: "4-60", bit: "D" }],
  },
  {
    name: "Yell Kong (3-60GB)",
    beys: [{ blade: "Yell Kong", ratchet: "3-60", bit: "GB" }],
  },
  {
    name: "Scarlet Garuda (4-70TP)",
    beys: [{ blade: "Scarlet Garuda", ratchet: "4-70", bit: "TP" }],
  },
  {
    name: "Soar Phoenix (5-80H)",
    beys: [{ blade: "Soar Phoenix", ratchet: "5-80", bit: "H" }],
  },
  {
    name: "Dagger Dran (4-70Q)",
    beys: [{ blade: "Dagger Dran", ratchet: "4-70", bit: "Q" }],
  },
  {
    name: "Keel Shark (1-60Q)",
    beys: [{ blade: "Keel Shark", ratchet: "1-60", bit: "Q" }],
  },
  {
    name: "Tide Whale (5-80E)",
    beys: [{ blade: "Tide Whale", ratchet: "5-80", bit: "E" }],
  },
  {
    name: "Pearl Tiger & Gill Shark (Dual Pack)",
    beys: [
      { blade: "Pearl Tiger", ratchet: "3-60", bit: "U" },
      { blade: "Gill Shark", ratchet: "4-70", bit: "O" },
    ],
  },
  {
    name: "Cowl Sphinx & Crest Leon (Dual Pack)",
    beys: [
      { blade: "Cowl Sphinx", ratchet: "1-80", bit: "GF" },
      { blade: "Crest Leon UX", ratchet: "7-60", bit: "GN" },
    ],
  },
  {
    name: "Courage Dran S CX (6-60V)",
    beys: [{ blade: "Courage Dran S", ratchet: "6-60", bit: "V" }],
  },
  {
    name: "Reaper Incendio T CX (4-70K)",
    beys: [{ blade: "Reaper Incendio T", ratchet: "4-70", bit: "K" }],
  },
  {
    name: "Arc Wizard R CX (4-55LO)",
    beys: [{ blade: "Arc Wizard R", ratchet: "4-55", bit: "LO" }],
  },
  {
    name: "Dark Perseus B CX (6-80W)",
    beys: [{ blade: "Dark Perseus B", ratchet: "6-80", bit: "W" }],
  },
];

const bladeSelect = document.getElementById("blade-select");
const ratchetSelect = document.getElementById("ratchet-select");
const bitSelect = document.getElementById("bit-select");
const form = document.getElementById("bey-form");
const results = document.getElementById("bey-results");
const creatorLayout = document.querySelector(".creator-layout");

if (form && bladeSelect && ratchetSelect && bitSelect && results) {

  const blades = new Set();
  const ratchets = new Set();
  const bits = new Set();

  const beys = products.reduce((acc, product) => {
    product.beys.forEach((bey) => {
      acc.push({ ...bey, product: product.name });
    });
    return acc;
  }, []);

  beys.forEach((bey) => {
    blades.add(bey.blade);
    ratchets.add(bey.ratchet);
    bits.add(bey.bit);
  });

  const sortedBlades = Array.from(blades).sort((a, b) =>
    a.localeCompare(b, "it")
  );
  const sortedRatchets = Array.from(ratchets).sort((a, b) =>
    a.localeCompare(b, "it", { numeric: true })
  );
  const sortedBits = Array.from(bits).sort((a, b) => a.localeCompare(b, "it"));

  sortedBlades.forEach((blade) => {
    const option = document.createElement("option");
    option.value = blade;
    option.textContent = blade;
    bladeSelect.appendChild(option);
  });

  sortedRatchets.forEach((ratchet) => {
    const option = document.createElement("option");
    option.value = ratchet;
    option.textContent = ratchet;
    ratchetSelect.appendChild(option);
  });

  sortedBits.forEach((bit) => {
    const option = document.createElement("option");
    option.value = bit;
    option.textContent = bit === "?" ? "Non specificato" : bit;
    bitSelect.appendChild(option);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const blade = bladeSelect.value.trim();
    const ratchet = ratchetSelect.value.trim();
    const bit = bitSelect.value.trim();

    const candidates = beys.filter(
      (bey) =>
        bey.blade === blade || bey.ratchet === ratchet || bey.bit === bit
    );

    const comboKeys = new Set();
    const combos = [];

    const coversTarget = (combo) => ({
      blade: combo.some((bey) => bey.blade === blade),
      ratchet: combo.some((bey) => bey.ratchet === ratchet),
      bit: combo.some((bey) => bey.bit === bit),
    });

    const pushCombo = (combo) => {
      const key = combo
        .map((bey) => `${bey.blade}|${bey.ratchet}|${bey.bit}`)
        .sort()
        .join("||");
      if (!comboKeys.has(key)) {
        comboKeys.add(key);
        combos.push(combo);
      }
    };

    for (let i = 0; i < candidates.length; i += 1) {
      const one = [candidates[i]];
      const cover = coversTarget(one);
      if (cover.blade && cover.ratchet && cover.bit) {
        pushCombo(one);
      }
    }

    for (let i = 0; i < candidates.length; i += 1) {
      for (let j = i + 1; j < candidates.length; j += 1) {
        const two = [candidates[i], candidates[j]];
        const cover = coversTarget(two);
        if (cover.blade && cover.ratchet && cover.bit) {
          pushCombo(two);
        }
      }
    }

    for (let i = 0; i < candidates.length; i += 1) {
      for (let j = i + 1; j < candidates.length; j += 1) {
        for (let k = j + 1; k < candidates.length; k += 1) {
          const three = [candidates[i], candidates[j], candidates[k]];
          const cover = coversTarget(three);
          if (cover.blade && cover.ratchet && cover.bit) {
            pushCombo(three);
          }
        }
      }
    }

    combos.sort((a, b) => a.length - b.length);

    if (combos.length === 0) {
      results.innerHTML = `
        <h2>Risultato</h2>
        <p class="muted">Nessuna combinazione trovata con massimo 3 bey.</p>
      `;
      return;
    }

    const maxOptions = 8;
    const shown = combos.slice(0, maxOptions);
    const optionHtml = shown
      .map((combo, index) => {
        const items = combo
          .map(
            (bey) =>
              `<div class="result-pill">${bey.blade} (${bey.ratchet}${bey.bit})<span class="pill-note">Prodotto: ${bey.product}</span></div>`
          )
          .join("");
        return `
          <div class="result-combo">
            <p class="combo-title">Opzione ${index + 1} · ${combo.length} bey</p>
            <div class="result-list">${items}</div>
          </div>
        `;
      })
      .join("");

    const extraNote =
      combos.length > maxOptions
        ? `<p class="muted">Altre ${combos.length - maxOptions} opzioni disponibili.</p>`
        : "";

    results.innerHTML = `
      <h2>Risultato</h2>
      <p>Per ottenere <strong>${blade} ${ratchet}${bit}</strong> puoi comprare questi bey (max 3):</p>
      ${optionHtml}
      ${extraNote}
    `;
  });
}

const adminLogin = document.getElementById("admin-login");
const adminPanel = document.getElementById("admin-panel");
const refereeForm = document.getElementById("referee-form");
const eventForm = document.getElementById("event-form");
const eventSyncStatus = document.getElementById("event-sync-status");
const trainingForm = document.getElementById("training-form");
const trophyForm = document.getElementById("trophy-form");
const passwordForm = document.getElementById("password-form");
const resetButton = document.getElementById("reset-data");
const logoutButton = document.getElementById("admin-logout");

const setAdminFormsEnabled = (enabled) => {
  [refereeForm, eventForm, trainingForm, trophyForm, passwordForm].forEach(
    (form) => {
      if (!form) {
        return;
      }
      const fields = form.querySelectorAll("input, textarea, button, select");
      fields.forEach((field) => {
        field.disabled = !enabled;
      });
    }
  );
  const adminListButtons = document.querySelectorAll(
    "#referee-list-admin button, #event-list button, #training-list button, #trophy-list button"
  );
  adminListButtons.forEach((button) => {
    button.disabled = !enabled;
  });
  if (resetButton) {
    resetButton.disabled = !enabled;
  }
};

const showAdminPanel = () => {
  if (adminPanel) {
    adminPanel.hidden = false;
    adminPanel.style.display = "grid";
  }
  if (adminLogin) {
    adminLogin.hidden = true;
  }
  setAdminFormsEnabled(true);
  renderAdminLists();
};

const hideAdminPanel = () => {
  if (adminPanel) {
    adminPanel.hidden = true;
    adminPanel.style.display = "none";
  }
  if (adminLogin) {
    adminLogin.hidden = false;
  }
  setAdminFormsEnabled(false);
};

const refreshAdminVisibility = () => {
  if (isAdminLoggedIn()) {
    showAdminPanel();
  } else {
    hideAdminPanel();
  }
};

if (adminLogin || adminPanel) {
  refreshAdminVisibility();
  window.addEventListener("admin-auth-change", refreshAdminVisibility);
}

if (eventForm) {
  eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isAdminLoggedIn()) {
      alert("Devi fare login admin per modificare gli eventi.");
      return;
    }

    const challongeUrlInput = document.getElementById("event-challonge-url");
    if (challongeUrlInput) {
      const challongeUrl = challongeUrlInput.value.trim();
      if (!challongeUrl) {
        if (eventSyncStatus) {
          eventSyncStatus.textContent = "Incolla un link Challonge valido.";
        }
        return;
      }

      if (eventSyncStatus) {
        eventSyncStatus.textContent = "Importazione Challonge in corso...";
      }

      try {
        if (typeof window.kobraKayImportTournament !== "function") {
          throw new Error("import-unavailable");
        }
        const result = await window.kobraKayImportTournament(challongeUrl);
        if (eventSyncStatus) {
          eventSyncStatus.textContent = `Torneo importato: ${result.title}`;
        }
        eventForm.reset();
      } catch (error) {
        if (eventSyncStatus) {
          eventSyncStatus.textContent =
            error.message === "import-unavailable"
              ? "Import Challonge non disponibile nel frontend."
              : error.message || "Importazione Challonge non riuscita.";
        }
      }
      return;
    }

    const dateInput = document.getElementById("event-date");
    const titleInput = document.getElementById("event-title");
    const descInput = document.getElementById("event-desc");
    if (!dateInput || !titleInput || !descInput) {
      return;
    }
    const date = dateInput.value.trim();
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    if (firestore) {
      firestore.collection("events").add({
        date,
        title,
        description,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
    eventForm.reset();
  });
}

if (refereeForm) {
  refereeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdminLoggedIn()) {
      alert("Devi fare login admin per modificare i patentini arbitro.");
      return;
    }
    const name = document.getElementById("referee-name").value.trim();
    const licenseLevel = document.getElementById("referee-level").value.trim();
    if (firestore) {
      firestore.collection("refereeLicenses").add({
        name,
        licenseLevel,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
    refereeForm.reset();
  });
}

if (trainingForm) {
  trainingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdminLoggedIn()) {
      alert("Devi fare login admin per modificare gli allenamenti.");
      return;
    }
    const date = document.getElementById("training-date").value.trim();
    const title = document.getElementById("training-title").value.trim();
    const description = document.getElementById("training-desc").value.trim();
    if (firestore) {
      firestore.collection("trainings").add({
        date,
        title,
        description,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
    trainingForm.reset();
  });
}

if (trophyForm) {
  trophyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdminLoggedIn()) {
      alert("Devi fare login admin per modificare i trofei.");
      return;
    }
    const title = document.getElementById("trophy-title").value.trim();
    const name = document.getElementById("trophy-name").value.trim();
    const description = document.getElementById("trophy-desc").value.trim();
    if (firestore) {
      firestore.collection("trophies").add({
        title,
        name,
        description,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
    trophyForm.reset();
  });
}

if (passwordForm) {
  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdminLoggedIn()) {
      alert("Devi fare login admin per cambiare password.");
      return;
    }
    const newPassword = document.getElementById("new-password").value.trim();
    if (newPassword.length < 4) {
      alert("La password deve avere almeno 4 caratteri.");
      return;
    }
    localStorage.setItem(STORAGE.adminPassword, newPassword);
    passwordForm.reset();
    alert("Password aggiornata.");
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    if (!isAdminLoggedIn()) {
      alert("Devi fare login admin per ripristinare i dati.");
      return;
    }
    if (!firestore) {
      return;
    }
    const resetCollection = async (name, defaults) => {
      const snapshot = await firestore.collection(name).get();
      const batch = firestore.batch();
      snapshot.forEach((docSnap) => batch.delete(docSnap.ref));
      defaults.forEach((item, index) => {
        const ref = firestore.collection(name).doc(`default-${index + 1}`);
        batch.set(ref, {
          ...item,
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
      const metaRef = firestore.collection("meta").doc("seed");
      batch.set(metaRef, { [name]: true }, { merge: true });
      await batch.commit();
    };

    resetCollection("events", defaultEvents);
    resetCollection("trainings", defaultTrainings);
    resetCollection("trophies", defaultTrophies);
    resetCollection("refereeLicenses", []);
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("myagi_admin_logged_in");
    hideAdminPanel();
  });
}
