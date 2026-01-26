import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
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
  apiKey: "AIzaSyAOpQpKoGd2HGYih5-yBamk5Q5Lx4XtwC8",
  authDomain: "myago-do-club.firebaseapp.com",
  projectId: "myago-do-club",
  storageBucket: "myago-do-club.firebasestorage.app",
  messagingSenderId: "933756491648",
  appId: "1:933756491648:web:e29fef12414d3832c41365",
  measurementId: "G-RTRBE38TJM",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const authTabs = document.querySelectorAll(".auth-tab");
const authPanels = document.querySelectorAll(".auth-panel");
const cityInput = document.getElementById("auth-city-input");
const emailInput = document.getElementById("auth-email-input");
const passwordInput = document.getElementById("auth-password-input");
const emailRegisterButton = document.getElementById("email-register");
const emailLoginButton = document.getElementById("email-login");
const phoneCityInput = document.getElementById("phone-city-input");
const phoneInput = document.getElementById("phone-input");
const sendCodeButton = document.getElementById("send-code");
const smsCodeInput = document.getElementById("sms-code");
const verifyCodeButton = document.getElementById("verify-code");
const authStatus = document.getElementById("auth-status");
const logoutUserButton = document.getElementById("logout-button");
const postForm = document.getElementById("post-form");
const postNameInput = document.getElementById("post-name");
const postMessageInput = document.getElementById("post-message");
const postList = document.getElementById("post-list");
const postNote = document.getElementById("post-note");
const memberCount = document.getElementById("member-count");

let confirmationResult = null;
let recaptchaVerifier = null;

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

if (emailRegisterButton && emailInput && passwordInput) {
  emailRegisterButton.addEventListener("click", async () => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        emailInput.value.trim(),
        passwordInput.value.trim()
      );
      await ensureUserDoc(result.user, {
        citta: cityInput ? cityInput.value.trim() : null,
      });
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

if (sendCodeButton && phoneInput) {
  sendCodeButton.addEventListener("click", async () => {
    try {
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }
      confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneInput.value.trim(),
        recaptchaVerifier
      );
      alert("Codice inviato via SMS.");
    } catch (error) {
      alert("Invio codice fallito: " + error.message);
    }
  });
}

if (verifyCodeButton && smsCodeInput) {
  verifyCodeButton.addEventListener("click", async () => {
    if (!confirmationResult) {
      alert("Prima invia il codice SMS.");
      return;
    }
    try {
      const result = await confirmationResult.confirm(
        smsCodeInput.value.trim()
      );
      await ensureUserDoc(result.user, {
        citta: phoneCityInput ? phoneCityInput.value.trim() : null,
      });
      setLoginFlag(true);
    } catch (error) {
      alert("Codice non valido: " + error.message);
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
  } else {
    setAuthStatus("Stato: non autenticato.", false);
    setLoginFlag(false);
  }
});
