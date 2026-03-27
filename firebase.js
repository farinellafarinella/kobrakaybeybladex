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
  doc,
  setDoc,
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
const postForm = document.getElementById("post-form");
const postNameInput = document.getElementById("post-name");
const postMessageInput = document.getElementById("post-message");
const postList = document.getElementById("post-list");
const postNote = document.getElementById("post-note");
const memberCount = document.getElementById("member-count");

const googleProvider = new GoogleAuthProvider();
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const isHomePage = currentPage === "index.html";
const nextPage = new URLSearchParams(window.location.search).get("next");

const setLoginFlag = (value) => {
  const flag = value ? "true" : "false";
  localStorage.setItem("myagi_logged_in", flag);
  sessionStorage.setItem("myagi_logged_in", flag);
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
  if (isHomePage) {
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

if (postForm && postList) {
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
      postNameInput.value.trim() ||
      user.displayName ||
      user.email ||
      user.phoneNumber ||
      "Blader";
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await ensureUserDoc(user);
    const label = user.email || user.phoneNumber || "utente";
    setAuthStatus(`Stato: loggato (${label}).`, true);
    setLoginFlag(true);
    unlockSite();
    if (isHomePage && nextPage && nextPage !== "index.html") {
      window.location.replace(nextPage);
      return;
    }
  } else {
    setAuthStatus("Stato: non autenticato.", false);
    setLoginFlag(false);
    redirectToLogin();
  }
});
