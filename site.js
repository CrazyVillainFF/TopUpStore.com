import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getDatabase, ref as dbRef, push, serverTimestamp, onValue, update, set, get, runTransaction, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPHv_ibm0KB025gGCKgsn_biOcokcbS9c",
  authDomain: "topup-store-2d708.firebaseapp.com",
  databaseURL: "https://topup-store-2d708-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "topup-store-2d708",
  messagingSenderId: "135503745090",
  appId: "1:135503745090:web:878f62cc297e33be151ddb",
  measurementId: "G-T81SY3RG3B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
export const database = getDatabase(app);
const POINTS_PER_RUPEE = 1 / 20;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

export const TopupData = {
  upiId: "7667107386@ptyes",
  paymentQr: "payment-qr.jpg",
  cloudinaryCloudName: "dbctbgoum",
  cloudinaryUploadPreset: "UnlimitedTopUpo",
  adminEmails: ["unlimitedtopup001@gmail.com", "vishnubangaru001@gmail.com"],
  games: {
    freefire: { name: "Free Fire", item: "Diamonds", logo: "freefire.svg.png", background: "https://dl.dir.freefiremobile.com/common/web_event/official2.ff.garena.all/20261/d0c5242292a393c0a61f92b6794bae4b.jpeg", page: "freefire.html", description: "Fast diamond packs and memberships for Free Fire accounts with UPI checkout.", bundles: [{ label: "100 Diamonds", amount: 79 }, { label: "310 Diamonds", amount: 240 }, { label: "520 Diamonds", amount: 399 }, { label: "1060 Diamonds", amount: 799 }, { label: "Weekly Membership", amount: 159 }, { label: "Monthly Membership", amount: 799 }] },
    bgmi: { name: "BGMI", item: "UC", logo: "bgmi.svg.jpg", background: "https://sm.ign.com/ign_in/screenshot/default/bgmi-33-update-image-3_p7yr.jpg", page: "bgmi.html", description: "BGMI UC packs with clear manual order tracking.", bundles: [{ label: "60 UC", amount: 75 }, { label: "325 UC", amount: 380 }, { label: "660 UC", amount: 750 }, { label: "1800 UC", amount: 1850 }] },
    pubg: { name: "PUBG Mobile", item: "UC", logo: "pubg.svg.png", background: "https://wallpapercave.com/wp/wp6539431.jpg", page: "pubg.html", description: "PUBG Mobile UC bundles with a clear payment summary before checkout.", bundles: [{ label: "60 UC", amount: 75 }, { label: "325 UC", amount: 380 }, { label: "660 UC", amount: 750 }, { label: "1800 UC", amount: 1850 }] },
    valorant: { name: "Valorant", item: "VP", logo: "https://freelogopng.com/images/all_img/1664302472valorant-logo%20png-black.png", background: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/dd544c5c423909d0cb40c64def103bcbf6dd312c-1920x1080.jpg?accountingTag=val_esports&auto=format&fit=max&w=3840", page: "valorant.html", description: "Valorant Points bundles for your Riot account with clear manual payment verification.", bundles: [{ label: "475 VP", amount: 410, originalAmount: 435 }, { label: "1000 VP", amount: 840, originalAmount: 870 }, { label: "1520 VP", amount: 1360, originalAmount: 1425 }, { label: "2050 VP", amount: 1670, originalAmount: 1740 }, { label: "2575 VP", amount: 2270, originalAmount: 2375 }, { label: "3650 VP", amount: 3000, originalAmount: 3325 }] },
    minecraft: { name: "Minecraft", item: "Minecoins", logo: "https://thumbs.dreamstime.com/b/minecraft-logo-online-game-dirt-block-illustrations-concept-design-isolated-186775550.jpg", background: "https://i.tlauncher.org/images/26.2-Snapshot4-preview.png", page: "minecraft.html", description: "Minecraft Minecoins packs with simple checkout. No game ID number required.", noGameId: true, bundles: [{ label: "1720 Minecoins", amount: 680, originalAmount: 735 }, { label: "3500 Minecoins", amount: 1389, originalAmount: 1457 }] },
    minecraftpc: { name: "Minecraft", item: "Java & Bedrock Edition PC Key", logo: "https://thumbs.dreamstime.com/b/minecraft-logo-online-game-dirt-block-illustrations-concept-design-isolated-186775550.jpg?w=768", background: "https://4kwallpapers.com/images/walls/thumbs_2t/26078.jpg", page: "minecraft-pc.html", description: "Minecraft: Java & Bedrock Edition activation key for PC, delivered to your active email after payment verification.", noGameId: true, bundles: [{ label: "Minecraft: Java & Bedrock Edition (PC) Activation Key", amount: 1900, originalAmount: 2605 }] },
    gta5: { name: "GTA 5", item: "Premium Edition Game Key", logo: "https://crystalpng.com/wp-content/uploads/2025/06/GTA-5.png", background: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1WEskcbQFCeO1t95xNp6lwvWq65M04VpJmR1MflZyoY7YD9z4jXj6Ekp8&s=10", page: "gta5.html", description: "GTA 5 Premium Edition activation key for Rockstar Games Launcher, delivered to your active email after verification.", noGameId: true, bundles: [{ label: "GTA 5 Premium Edition (Game Key)", amount: 1500, originalAmount: 2499 }] },
    gta6: { name: "GTA 6", item: "Coming Soon", logo: "https://4kwallpapers.com/images/walls/thumbs_3t/13622.png", background: "https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_01_landscape.12x2gvspcm_3m.jpg?akim=1&imdensity=1&imwidth=1280", page: "gta6.html", description: "Grand Theft Auto VI notifications are opening soon. Join the alert list and we will contact you when GTA 6 is available.", noGameId: true, comingSoon: true, bundles: [] },
    forza5: { name: "Forza Horizon 5", item: "PC/XBOX Live Key", logo: "https://upload.wikimedia.org/wikipedia/en/8/86/Forza_Horizon_5_cover_art.jpg", background: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2i6WhUs0fzU9ntn2TPVFAHKC1IZenANX7R0ZSU0xhMYAvWeltAW1QaLsk&s=10", page: "forza-horizon-5.html", description: "Forza Horizon 5 PC/XBOX Live activation key delivered to your active email after payment verification.", noGameId: true, bundles: [{ label: "Forza Horizon 5 PC/XBOX Live Key", amount: 3500, originalAmount: 7646 }] },
    forza6: { name: "Forza Horizon 6", item: "Standard Edition XBOX Live Key", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/Forza_Horizon_6_key_art.jpeg/250px-Forza_Horizon_6_key_art.jpeg", background: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ7VPE-TXWWh4wFk-n0d8TOZDdvmEAxnH8DeJ-JLUvNNXOqnLMizIbYX7g&s=10", page: "forza-horizon-6.html", description: "Forza Horizon 6 Standard Edition for Windows/Xbox Series X/S, delivered as an XBOX Live key.", noGameId: true, bundles: [{ label: "Forza Horizon 6 Standard Edition (Windows/Xbox Series X/S) XBOX Live Key", amount: 5300, originalAmount: 5499 }] },
    residentevil: { name: "Resident Evil Requiem", item: "Xbox Series X/S Xbox Live Key", logo: "https://wallpapercave.com/wp/wp15649795.jpg", background: "https://wallpapercave.com/wp/wp15649778.png", page: "resident-evil-requiem.html", description: "Resident Evil Requiem for Xbox Series X/S, delivered as an Xbox Live activation key.", noGameId: true, bundles: [{ label: "Resident Evil Requiem (Xbox Series X/S) Xbox Live Key", amount: 5550, originalAmount: 6268 }] },
    fallout4: { name: "Fallout 4", item: "Steam PC Key India", logo: "https://images7.alphacoders.com/599/thumb-1920-599168.png", background: "https://images.wallpapersden.com/image/download/fallout-4-game_a2xna26UmZqaraWkpJRobWllrWdma2U.jpg", page: "fallout-4.html", description: "Fallout 4 Steam activation key for PC in India, delivered to your active email after payment verification.", noGameId: true, bundles: [{ label: "Fallout 4 Steam (PC) Key India", amount: 600, originalAmount: 1000 }] },
    raji: { name: "Raji: An Ancient Epic", item: "Steam Key Global", logo: "https://sm.ign.com/ign_in/cover/r/raji-an-an/raji-an-ancient-epic_te44.jpg", background: "https://wallpapercave.com/wp/wp7717509.jpg", page: "raji-an-ancient-epic.html", description: "Raji: An Ancient Epic global Steam activation key delivered to your active email after payment verification.", noGameId: true, bundles: [{ label: "Raji: An Ancient Epic Steam Key Global", amount: 200, originalAmount: 600 }] },
    assassinscreed2: { name: "Assassin's Creed II", item: "PC Ubisoft Connect Key", logo: "https://wallpapercave.com/wp/3U55bWo.jpg", background: "https://wallpapercave.com/wp/G3YUJoT.jpg", page: "assassins-creed-2.html", description: "Assassin's Creed II activation key for Ubisoft Connect on PC, delivered after payment verification.", noGameId: true, bundles: [{ label: "Assassin's Creed II - PC (Ubisoft Connect)", amount: 520, originalAmount: 1083 }] },
    spiderman: { name: "Marvel's Spider-Man Remastered", item: "PC Steam Key", logo: "https://wallpapercave.com/wp/wp7593605.jpg", background: "https://wallpapercave.com/wp/wp7593625.jpg", page: "spider-man-remastered.html", description: "Marvel's Spider-Man Remastered Steam key for PC, delivered after payment verification.", noGameId: true, bundles: [{ label: "Marvel's Spider-Man Remastered - PC (Steam)", amount: 2500, originalAmount: 3999 }] }
  }
};

let currentUser = undefined;
let currentProfileCache = null;
let stopPointsOrders = null;
let stopPointsRedemptions = null;
export const authReady = new Promise((resolve) => onAuthStateChanged(auth, (user) => { currentUser = user; resolve(user); }));
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  currentProfileCache = null;
  updateHeaderFromAuth();
  startLivePointsSync(user);
});

function withTimeout(promise, message = "Request timed out. Check your setup and internet connection.", ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
}

export function money(amount) { return "INR " + Number(amount).toFixed(2); }
export function discountPercent(bundle) {
  if (bundle?.originalAmount) return ((Number(bundle.originalAmount) - Number(bundle.amount)) / Number(bundle.originalAmount)) * 100;
  return /membership/i.test(bundle?.label || "") ? 1 : 5;
}
export function discounted(amount, apply, bundle = null) {
  if (bundle?.originalAmount) return Number(bundle.amount);
  if (!apply) return Number(amount);
  return Number(amount) * (1 - discountPercent(bundle) / 100);
}
export function gmailValid(email) { return /^[^\s@]+@gmail\.com$/i.test(email); }
export function emailValid(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email); }
export function strongPassword(password) { return password.length >= 8 && /[a-z]/.test(password) && /\d/.test(password) && (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)); }

function authMessage(error) {
  const code = error?.code || "";
  if (code === "auth/email-already-in-use") return "This Gmail ID is already registered. Use Login instead.";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") return "Incorrect email or password.";
  if (code === "auth/user-not-found") return "No account found for this Gmail ID. Create an account first.";
  if (code === "auth/weak-password") return "Password must be at least 6 characters.";
  if (code === "auth/operation-not-allowed") return "Enable Email/Password in Firebase Authentication first.";
  if (code === "auth/popup-closed-by-user") return "Google sign-in was closed before finishing.";
  if (code === "auth/popup-blocked") return "Browser blocked Google sign-in popup. Allow popups and try again.";
  if (code === "auth/account-exists-with-different-credential") return "This email is already linked with another sign-in method.";
  if (code === "permission-denied") return "Firebase permission denied. Check Realtime Database rules and your login.";
  if (code === "auth/network-request-failed") return "Network error. Check your internet connection.";
  return error?.message || "Firebase request failed.";
}

function readableOrderError(error) {
  const message = error?.message || "";
  const code = error?.code || "";
  if (code === "PERMISSION_DENIED" || /permission_denied|permission denied/i.test(message)) {
    return "Realtime Database blocked this order. Open Firebase Realtime Database > Rules and publish the rules from realtime-database-rules.json.";
  }
  if (/database.*not found|not found/i.test(message)) {
    return "Realtime Database URL is wrong or database is not created. Check your Firebase Realtime Database URL.";
  }
  if (/cloudinary|upload preset|preset/i.test(message)) {
    return "Cloudinary upload failed. Check cloud name dbctbgoum and unsigned upload preset UnlimitedTopUpo.";
  }
  if (/failed to fetch|network/i.test(message)) {
    return "Upload failed because internet/network request was blocked. Try again after checking connection.";
  }
  return message || "Could not submit order. Please try again.";
}

export async function ensureUserProfile(user = auth.currentUser) {
  if (!user) return null;
  if (currentProfileCache?.uid === user.uid) return currentProfileCache;
  const username = user.displayName || user.email.split("@")[0];
  const userRef = dbRef(database, `users/${user.uid}`);
  const snapshot = await get(userRef).catch(() => null);
  const saved = snapshot?.exists() ? snapshot.val() : {};
  const points = Number(saved?.points) || 0;
  currentProfileCache = { uid: user.uid, username: saved?.username || username, email: saved?.email || user.email, points };
  if (!snapshot?.exists()) {
    await set(userRef, {
      username,
      email: user.email,
      points: 0,
      createdAt: serverTimestamp()
    }).catch(() => {});
  }
  return currentProfileCache;
}
export async function createAccount(username, email, password) {
  try {
    const credential = await withTimeout(createUserWithEmailAndPassword(auth, email, password), "Signup timed out. Check Email/Password provider.");
    await updateProfile(credential.user, { displayName: username });
    await set(dbRef(database, `users/${credential.user.uid}`), {
      username,
      email: credential.user.email,
      points: 0,
      createdAt: serverTimestamp()
    }).catch(() => {});
    currentProfileCache = { uid: credential.user.uid, username, email: credential.user.email, points: 0 };
    return { ok: true };
  } catch (error) {
    return { ok: false, message: authMessage(error) };
  }
}

export async function loginAccount(email, password) {
  try {
    const credential = await withTimeout(signInWithEmailAndPassword(auth, email, password), "Login timed out. Check Firebase Authentication.", 6000);
    ensureUserProfile(credential.user).catch((profileError) => console.warn("Profile load failed", profileError));
    return { ok: true };
  } catch (error) {
    return { ok: false, message: authMessage(error) };
  }
}

export async function loginWithGoogle() {
  try {
    const credential = await withTimeout(signInWithPopup(auth, googleProvider), "Google sign-in timed out. Allow popups and make sure this domain is added in Firebase Authentication > Settings > Authorized domains.", 15000);
    ensureUserProfile(credential.user).catch((profileError) => console.warn("Profile load failed", profileError));
    return { ok: true };
  } catch (error) {
    return { ok: false, message: authMessage(error) };
  }
}

export async function logoutAccount() { await signOut(auth); }

export async function resetPassword(email) {
  try {
    await withTimeout(sendPasswordResetEmail(auth, email), "Password reset request timed out.");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: authMessage(error) };
  }
}

export function showLoading(message = "Loading...") {
  let loader = document.querySelector("[data-page-loader]");
  if (!loader) {
    loader = document.createElement("div");
    loader.className = "page-loader";
    loader.dataset.pageLoader = "";
    loader.innerHTML = `<div class="loader-card"><span class="big-spinner"></span><strong data-loader-message></strong></div>`;
    document.body.appendChild(loader);
  }
  loader.querySelector("[data-loader-message]").textContent = message;
  loader.classList.add("open");
}

export function hideLoading() {
  document.querySelector("[data-page-loader]")?.classList.remove("open");
}

async function uploadPaymentScreenshot(file, orderId) {
  if (!TopupData.cloudinaryCloudName || !TopupData.cloudinaryUploadPreset) {
    throw new Error("Cloudinary setup is missing.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", TopupData.cloudinaryUploadPreset);
  formData.append("folder", "payment-screenshots");
  formData.append("public_id", `${orderId}-${Date.now()}`);
  const response = await withTimeout(fetch(`https://api.cloudinary.com/v1_1/${TopupData.cloudinaryCloudName}/image/upload`, {
    method: "POST",
    body: formData
  }), "Could not upload payment screenshot to Cloudinary.", 25000);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Cloudinary screenshot upload failed.");
  return data.secure_url;
}

export async function currentProfile() {
  await authReady;
  return ensureUserProfile(auth.currentUser);
}

export async function currentPoints() {
  try {
    await authReady;
    if (!auth.currentUser) return 0;
    return await calculateUserPoints(auth.currentUser.uid);
  } catch {
    return 0;
  }
}

function showPaymentPanel(order) {
  order.reference = order.reference || `UT${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const oldModal = document.querySelector("[data-payment-modal]");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.className = "modal open payment-modal";
  modal.dataset.paymentModal = "";
  modal.innerHTML = `
    <div class="modal-panel payment-panel">
      <div class="modal-head">
        <div>
          <h2>Complete Payment</h2>
          <p class="muted">Pay manually, then submit your UTR number and payment screenshot.</p>
        </div>
        <button class="icon-btn" data-close-payment aria-label="Close">x</button>
      </div>
      <div class="payment-summary">
        <img class="payment-qr" src="${TopupData.paymentQr}" alt="Unlimited Topup payment QR code">
        <div class="payment-details">
          <span>Payable Amount</span>
          <strong>${money(order.amount)}</strong>
          <p>${order.game} - ${order.bundle}</p>
          <p>Game ID Name: ${escapeHtml(order.username)}</p>
          ${order.playerId ? `<p>Game ID: ${escapeHtml(order.playerId)}</p>` : ""}
          <p>Email: ${escapeHtml(order.customerEmail)}</p>
        </div>
      </div>
      <div class="reward-notice">
        Pay manually using GPay / PhonePe / Paytm to this UPI ID: <span class="upi-id">${escapeHtml(TopupData.upiId)}</span>
      </div>
      <div class="notice">
        After payment, enter your UPI Transaction ID / UTR number and upload the payment screenshot. Your order status will be Pending Verification.
      </div>
      <form class="manual-payment-form form-grid" data-manual-payment-form>
        <label>Player ID<input value="${escapeHtml(order.playerId || "Not required")}" readonly></label>
        <label>Player Name<input value="${escapeHtml(order.username)}" readonly></label>
        <label>Game<input value="${escapeHtml(order.game)}" readonly></label>
        <label>Product / Package<input value="${escapeHtml(order.bundle)}" readonly></label>
        <label>Amount<input value="${money(order.amount)}" readonly></label>
        <label>UPI Transaction ID / UTR number<input data-utr placeholder="Enter UTR number" minlength="6" required></label>
        <label class="full">Payment screenshot upload<input data-screenshot type="file" accept="image/*" required></label>
        <div class="notice full" data-payment-status>
          ${auth.currentUser ? "Submit after payment. Your order will be saved for admin verification." : "Login or sign up to submit this order."}
        </div>
        <button class="btn success full" type="submit">Submit Payment Proof</button>
        ${auth.currentUser ? "" : '<a class="link-btn full" href="login.html">Login / Sign Up</a>'}
        <button class="btn ghost full" type="button" data-close-payment>Close</button>
      </form>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-close-payment]").forEach((button) => button.addEventListener("click", () => modal.remove()));
  modal.querySelector("[data-manual-payment-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = modal.querySelector("[data-payment-status]");
    const submit = form.querySelector("button[type='submit']");
    const utr = form.querySelector("[data-utr]").value.trim();
    const screenshot = form.querySelector("[data-screenshot]").files[0];
    if (!auth.currentUser) {
      window.location.href = "login.html";
      return;
    }
    if (!utr) {
      alert("Please enter UPI Transaction ID / UTR number.");
      return;
    }
    if (!screenshot) {
      alert("Please upload payment screenshot.");
      return;
    }
    submit.disabled = true;
    submit.textContent = "Submitting...";
    status.textContent = "Uploading screenshot and saving order...";
    try {
      await saveOrder({ ...order, utr, screenshot });
      await refreshPoints();
      modal.remove();
      showOrderSubmittedPopup();
    } catch (error) {
      console.error("Payment proof submit failed", error);
      status.textContent = readableOrderError(error);
      submit.disabled = false;
      submit.textContent = "Submit Payment Proof";
    }
  });
  return modal;
}

export async function saveOrder(order) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login before placing an order.");
  if (!order.utr) throw new Error("Please enter UPI Transaction ID / UTR number.");
  if (!order.screenshot) throw new Error("Please upload payment screenshot.");
  const profile = await ensureUserProfile(user);
  const pointsEarned = Math.floor(Number(order.amount) * POINTS_PER_RUPEE);
  order.reference = order.reference || `UT${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const orderRef = push(dbRef(database, "orders"));
  const baseOrder = {
    uid: user.uid,
    accountUsername: profile.username,
    accountEmail: user.email,
    game: order.game,
    item: order.item,
    bundle: order.bundle,
    username: order.username,
    playerId: order.playerId || "",
    customerEmail: order.customerEmail,
    amount: Number(order.amount),
    utr: order.utr,
    screenshotUrl: "",
    screenshotStatus: "Uploading",
    pointsEarned,
    deliveryType: isDigitalKeyOrder(order) ? "gameKey" : "topup",
    gameKey: isDigitalKeyOrder(order) ? "Pending" : "",
    paymentReference: order.reference,
    status: "Pending Verification",
    createdAt: serverTimestamp()
  };
  try {
    await withTimeout(set(orderRef, baseOrder), "Could not save order in Firebase Realtime Database.");
    rememberLocalOrder(orderRef.key, { ...baseOrder, createdAt: Date.now() });
  } catch (error) {
    throw new Error(readableOrderError(error));
  }
  try {
    const screenshotUrl = await uploadPaymentScreenshot(order.screenshot, orderRef.key);
    await withTimeout(update(orderRef, {
      screenshotUrl,
      screenshotStatus: "Uploaded",
      updatedAt: serverTimestamp()
    }), "Could not save screenshot link in Firebase Realtime Database.");
  } catch (error) {
    await update(orderRef, {
      screenshotStatus: "Upload Failed",
      screenshotError: readableOrderError(error),
      updatedAt: serverTimestamp()
    }).catch(() => {});
    throw new Error(readableOrderError(error));
  }
}

function localOrdersKey() {
  return auth.currentUser ? `ut-local-orders-${auth.currentUser.uid}` : "ut-local-orders";
}

function rememberLocalOrder(id, order) {
  if (!id || !auth.currentUser) return;
  try {
    const key = localOrdersKey();
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    const next = [{ id, ...order }, ...saved.filter((item) => item.id !== id)].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(next));
  } catch (error) {
    console.warn("Could not save local order copy", error);
  }
}

function readLocalOrders() {
  if (!auth.currentUser) return [];
  try {
    return JSON.parse(localStorage.getItem(localOrdersKey()) || "[]");
  } catch {
    return [];
  }
}
function navHtml(active) {
  const nav = [["index", "Home", "index.html"], ["freefire", "Free Fire", "freefire.html"], ["bgmi", "BGMI", "bgmi.html"], ["pubg", "PUBG", "pubg.html"], ["valorant", "Valorant", "valorant.html"], ["minecraft", "Minecoins", "minecraft.html"], ["minecraftpc", "Minecraft PC", "minecraft-pc.html"], ["gta5", "GTA 5", "gta5.html"], ["assassinscreed2", "Assassin's Creed II", "assassins-creed-2.html"], ["fallout4", "Fallout 4", "fallout-4.html"], ["forza5", "Forza Horizon 5", "forza-horizon-5.html"], ["forza6", "Forza Horizon 6", "forza-horizon-6.html"], ["raji", "Raji", "raji-an-ancient-epic.html"], ["residentevil", "Resident Evil", "resident-evil-requiem.html"], ["spiderman", "Spider-Man", "spider-man-remastered.html"]];
  return nav.map(([key, label, href]) => `<a class="${active === key ? "active" : ""}" href="${href}">${label}</a>`).join("");
}

function isDigitalGameKey(game) {
  return Boolean(game && /key/i.test(String(game.item || "")));
}

function isDigitalKeyOrder(order) {
  return Boolean(order && (
    order.deliveryType === "gameKey" ||
    /key/i.test(String(order.item || order.bundle || ""))
  ));
}

function menuHtml(active, isLoggedIn = false) {
  const orders = isLoggedIn ? '<button type="button" class="menu-orders" data-your-orders>Your Orders</button>' : "";
  const logout = isLoggedIn ? '<button type="button" class="menu-logout" data-logout>Logout</button>' : "";
  return `<div class="mobile-menu-panel" data-mobile-menu>
    <a class="${active === "index" ? "active" : ""}" href="index.html">Home</a>
    <a href="index.html?filter=topup#games">Game Topup</a>
    <a href="index.html?filter=key#games">Game Key</a>
    ${orders}${logout}
  </div>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function profileAvatar(user, label) {
  const photo = user?.photoURL || "";
  const initial = (label || user?.email || "U").trim().charAt(0).toUpperCase();
  if (photo) return `<img class="profile-avatar" src="${escapeHtml(photo)}" alt="${escapeHtml(label)} profile photo" referrerpolicy="no-referrer">`;
  return `<span class="profile-avatar profile-avatar-fallback" aria-label="${escapeHtml(label)} profile photo">${escapeHtml(initial)}</span>`;
}

function headerShell(active, authHtml) {
  const isLoggedIn = /data-logout/.test(authHtml);
  return `<div class="page-shell navbar"><button class="menu-toggle" type="button" data-menu-toggle aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button><a class="brand" href="index.html"><span class="brand-mark">UT</span><span class="brand-text"><strong>Unlimited Topup</strong><span>Independent digital game store</span></span></a><nav class="nav-links desktop-nav">${navHtml(active)}</nav><div class="auth-area">${authHtml}</div>${menuHtml(active, isLoggedIn)}</div>`;
}

function bindSignOut(header) {
  header.querySelectorAll("[data-logout]").forEach((logout) => {
    logout.addEventListener("click", async () => { await logoutAccount(); window.location.href = "login.html"; });
  });
}

function bindYourOrders(header) {
  header.querySelectorAll("[data-your-orders]").forEach((button) => {
    button.addEventListener("click", () => showYourOrdersModal());
  });
}

function bindMobileMenu(header) {
  const toggle = header.querySelector("[data-menu-toggle]");
  const panel = header.querySelector("[data-mobile-menu]");
  if (!toggle || !panel) return;
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => header.classList.remove("menu-open")));
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) header.classList.remove("menu-open");
  });
}

const UT_COIN_ICON = "https://www.image2url.com/r2/default/images/1781790380169-306b426e-a9a8-4038-bb76-8ad91ae81e12.png";

function pointsMarkup(points) {
  return `<img class="ut-coin-inline" src="${UT_COIN_ICON}" alt="">${points} UT Coins`;
}

function authHtmlForUser(user, profile = null) {
  const label = profile?.username || user.displayName || user.email || "Profile";
  const email = user.email || "";
  const points = Number(profile?.points) || 0;
  return `<button class="btn ghost orders-btn" type="button" data-your-orders>Your Orders</button><div class="profile-chip">${profileAvatar(user, label)}<span class="profile-copy"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(email)}</small></span></div><span class="points-pill" data-points>${pointsMarkup(points)}</span><button class="btn ghost" data-logout>Logout</button>`;
}

function updateHeaderFromAuth() {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const active = header.dataset.active || "index";
  const guest = `<a class="link-btn" href="login.html">Login</a><a class="link-btn primary" href="signup.html">Sign Up</a>`;
  if (currentUser === undefined) {
    header.innerHTML = headerShell(active, `<span class="auth-loading"><span class="mini-spinner"></span> Checking login...</span>`);
    bindMobileMenu(header);
    return;
  }
  if (!currentUser) {
    header.innerHTML = headerShell(active, guest);
    bindMobileMenu(header);
    return;
  }
  const userForHeader = currentUser;
  header.innerHTML = headerShell(active, authHtmlForUser(userForHeader));
  bindSignOut(header);
  bindYourOrders(header);
  bindMobileMenu(header);
  withTimeout(ensureUserProfile(userForHeader), "Profile load skipped.", 5000)
    .then(async (profile) => {
      if (!auth.currentUser || auth.currentUser.uid !== userForHeader.uid) return;
      header.innerHTML = headerShell(active, authHtmlForUser(userForHeader, profile));
      bindSignOut(header);
      bindYourOrders(header);
      bindMobileMenu(header);
      await refreshPoints();
    })
    .catch((error) => console.warn("Profile load failed", error));
}

export function renderHeader(active) {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  header.dataset.active = active;
  header.innerHTML = headerShell(active, `<span class="auth-loading"><span class="mini-spinner"></span> Checking login...</span>`);
  bindMobileMenu(header);
  updateHeaderFromAuth();
}

async function requireLogin() {
  await authReady;
  if (auth.currentUser) return true;
  alert("Please login before placing an order.");
  window.location.href = "login.html";
  return false;
}

async function refreshPoints() {
  const points = await currentPoints();
  document.querySelectorAll("[data-points]").forEach((node) => { node.innerHTML = pointsMarkup(points); });
}

function fillBundleSelect(select, gameKey) {
  const game = TopupData.games[gameKey];
  if (!select || select.options.length > 1) return;
  select.innerHTML = '<option value="">Select a bundle</option>';
  game.bundles.forEach((bundle, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${bundle.label} - ${bundle.originalAmount ? money(bundle.originalAmount) + " -> " : ""}${money(bundle.amount)}`;
    select.appendChild(option);
  });
}

function bundleSummary(bundle, apply) {
  const finalAmount = discounted(bundle.amount, apply, bundle);
  const offer = bundle.originalAmount ? `${discountPercent(bundle).toFixed(2)}% product offer` : apply ? `${discountPercent(bundle)}% offer applied` : "Standard price";
  const original = bundle.originalAmount ? ` | Original ${money(bundle.originalAmount)}` : "";
  return `${bundle.label}${original} | ${offer} | Total ${money(finalAmount)}`;
}

export function initCatalogFilters() {
  const search = document.querySelector("[data-game-search]");
  const filterButtons = [...document.querySelectorAll("[data-game-filter]")];
  const cards = [...document.querySelectorAll(".game-grid .game-card")];
  const empty = document.querySelector("[data-catalog-empty]");
  if (!search || !filterButtons.length || !cards.length) return;

  const keyCategories = {
    freefire: "topup",
    bgmi: "topup",
    pubg: "topup",
    valorant: "topup",
    minecraft: "topup",
    minecraftpc: "key",
    gta5: "key",
    forza5: "key",
    forza6: "key",
    residentevil: "key",
    fallout4: "key",
    raji: "key",
    assassinscreed2: "key",
    spiderman: "key"
  };
  const requestedFilter = new URLSearchParams(window.location.search).get("filter");
  let activeFilter = ["all", "topup", "key"].includes(requestedFilter) ? requestedFilter : "all";

  cards.forEach((card) => {
    const action = card.querySelector("[data-open-order]");
    card.dataset.category = keyCategories[action?.dataset.openOrder] || "topup";
  });

  const apply = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchesText = !query || card.textContent.toLowerCase().includes(query);
      const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
      const show = matchesText && matchesFilter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  };

  search.addEventListener("input", apply);
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.gameFilter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    apply();
  }));

  filterButtons.forEach((button) => {
    const selected = button.dataset.gameFilter === activeFilter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  apply();
}

export function initOrderModal() {
  const modal = document.querySelector("[data-order-modal]");
  if (!modal) return;
  const title = modal.querySelector("[data-modal-title]");
  const username = modal.querySelector("[data-username]");
  const player = modal.querySelector("[data-player-id]");
  const customerEmail = modal.querySelector("[data-customer-email]");
  const bundle = modal.querySelector("[data-bundle]");
  const offer = modal.querySelector("[data-offer]");
  const summary = modal.querySelector("[data-summary]");
  const pay = modal.querySelector("[data-pay]");
  if (pay) pay.textContent = "Continue to Manual Payment";
  let currentKey = null;
  const update = () => {
    if (!currentKey || bundle.value === "") { summary.textContent = "Choose a bundle to see the final amount."; return; }
    const game = TopupData.games[currentKey];
    const selected = game.bundles[Number(bundle.value)];
    summary.textContent = bundleSummary(selected, game.noGameId ? true : offer.checked);
  };
  document.querySelectorAll("[data-open-order]").forEach((button) => button.addEventListener("click", async () => {
    if (!(await requireLogin())) return;
    currentKey = button.dataset.openOrder;
    const game = TopupData.games[currentKey];
    const digitalKey = isDigitalGameKey(game);
    title.textContent = `Order ${game.name} ${game.item}`;
    username.value = auth.currentUser?.displayName || (auth.currentUser?.email || "Customer").split("@")[0]; player.value = ""; customerEmail.value = auth.currentUser?.email || ""; offer.checked = true;
    username.closest("label").style.display = digitalKey ? "none" : "";
    player.closest("label").style.display = game.noGameId ? "none" : "";
    player.required = !game.noGameId;
    offer.closest("label").style.display = game.noGameId ? "none" : "";
    fillBundleSelect(bundle, currentKey); update(); modal.classList.add("open");
    (digitalKey ? customerEmail : (game.noGameId ? username : player)).focus();
  }));
  modal.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => modal.classList.remove("open")));
  bundle.addEventListener("change", update); offer.addEventListener("change", update);
  pay.addEventListener("click", async () => {
    if (!currentKey) return;
    const game = TopupData.games[currentKey];
    if (!isDigitalGameKey(game) && !username.value.trim()) { alert("Please enter your game ID name."); username.focus(); return; }
    if (!game.noGameId && !player.value.trim()) { alert("Please enter your game ID."); player.focus(); return; }
    if (!emailValid(customerEmail.value.trim())) { alert("Please enter your active email."); customerEmail.focus(); return; }
    if (bundle.value === "") { alert("Please select a bundle."); return; }
    const selected = game.bundles[Number(bundle.value)];
    const order = { username: username.value.trim(), game: game.name, item: game.item, bundle: selected.label, playerId: game.noGameId ? "" : player.value.trim(), customerEmail: customerEmail.value.trim(), amount: discounted(selected.amount, game.noGameId ? true : offer.checked, selected) };
    modal.classList.remove("open");
    showPaymentPanel(order);
  });
}

export function initGamePage(gameKey) {
  const game = TopupData.games[gameKey];
  if (!game) return;
  document.querySelectorAll("[data-game-name]").forEach((node) => { node.textContent = game.name; });
  document.querySelectorAll("[data-game-item]").forEach((node) => { node.textContent = game.item; });
  document.querySelectorAll("[data-game-logo]").forEach((node) => { node.src = game.logo; node.alt = game.name + " logo"; });
  document.querySelectorAll("[data-game-description]").forEach((node) => { node.textContent = game.description; });
  const plans = document.querySelector("[data-plan-grid]");
  if (plans && !plans.children.length) plans.innerHTML = game.bundles.map((bundle, index) => `<article class="plan-card"><img src="${game.logo}" alt="${game.name} logo"><div><strong>${bundle.label}</strong><span>${bundle.originalAmount ? `<s>${money(bundle.originalAmount)}</s> ` : ""}${money(bundle.amount)}</span>${bundle.originalAmount ? `<small class="field-help">${discountPercent(bundle).toFixed(2)}% offer</small>` : ""}</div><button class="btn ghost" data-select-plan="${index}">Select</button></article>`).join("");
  const form = document.querySelector("[data-game-form]");
  if (!form) return;
  const username = form.querySelector("[data-username]");
  const player = form.querySelector("[data-player-id]");
  const customerEmail = form.querySelector("[data-customer-email]");
  const bundle = form.querySelector("[data-bundle]");
  const offer = form.querySelector("[data-offer]");
  const summary = form.querySelector("[data-summary]");
  const submit = form.querySelector("button[type='submit']");
  const digitalKey = isDigitalGameKey(game);
  if (submit) submit.textContent = "Continue to Manual Payment";
  if (game.noGameId && player) {
    player.closest("label").style.display = "none";
    player.required = false;
  }
  if (game.noGameId && offer) offer.closest("label").style.display = "none";
  if (digitalKey && username) {
    username.closest("label").style.display = "none";
    username.required = false;
    username.value = auth.currentUser?.displayName || (auth.currentUser?.email || "Customer").split("@")[0];
  }
  fillBundleSelect(bundle, gameKey);
  const update = () => {
    if (bundle.value === "") { summary.textContent = "Select a bundle to calculate the final payable amount."; return; }
    const selected = game.bundles[Number(bundle.value)];
    summary.textContent = bundleSummary(selected, game.noGameId ? true : offer.checked);
  };
  if (game.bundles.length === 1) bundle.value = "0";
  update();
  bundle.addEventListener("change", update); offer.addEventListener("change", update);
  document.querySelectorAll("[data-select-plan]").forEach((button) => button.addEventListener("click", () => { bundle.value = button.dataset.selectPlan; update(); form.scrollIntoView({ behavior: "smooth", block: "center" }); }));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!(await requireLogin())) return;
    if (customerEmail && !customerEmail.value.trim()) customerEmail.value = auth.currentUser?.email || "";
    if (!digitalKey && !username.value.trim()) { alert("Please enter your game ID name."); username.focus(); return; }
    if (!game.noGameId && !player.value.trim()) { alert("Please enter your game ID."); player.focus(); return; }
    if (!emailValid(customerEmail.value.trim())) { alert("Please enter your active email."); customerEmail.focus(); return; }
    if (bundle.value === "") { alert("Please select a bundle."); return; }
    const selected = game.bundles[Number(bundle.value)];
    const order = { username: username.value.trim(), game: game.name, item: game.item, bundle: selected.label, playerId: game.noGameId ? "" : player.value.trim(), customerEmail: customerEmail.value.trim(), amount: discounted(selected.amount, game.noGameId ? true : offer.checked, selected) };
    showPaymentPanel(order);
  });
  update();
}

export function initRedeem() {
  const button = document.querySelector("[data-redeem]");
  if (!button) return;
  const rewards = [
    { coins: 300, value: 5 }, { coins: 600, value: 10 }, { coins: 900, value: 15 },
    { coins: 1200, value: 20 }, { coins: 1500, value: 25 }, { coins: 1800, value: 30 },
    { coins: 3000, value: 50 }, { coins: 6000, value: 100 }
  ];
  const redeemImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9fmWCNiCKZE3WjAsFAWneSLmBNl_J7K3FczQXzqvkwQ&s=10";

  button.addEventListener("click", async () => {
    if (!(await requireLogin())) return;
    const visibleBalance = Number.parseInt(document.querySelector("[data-points]")?.textContent || "0", 10) || 0;
    const modal = document.createElement("div");
    modal.className = "modal open";
    modal.dataset.redeemModal = "";
    modal.innerHTML = `
      <div class="modal-panel redeem-panel">
        <div class="modal-head"><div><div class="redeem-heading"><img src="${redeemImage}" alt="Google Play Store"><div><h2>Google Playstore Redeem Code</h2><p class="muted">Available balance: <strong data-redeem-balance>${pointsMarkup(visibleBalance)}</strong></p></div></div></div><button class="icon-btn" type="button" data-close-redeem aria-label="Close">x</button></div>
        <div data-redeem-step="form">
          <div class="redeem-options">${rewards.map((reward, index) => `<button class="redeem-option" type="button" data-reward-index="${index}"><strong><img class="ut-coin-inline" src="${UT_COIN_ICON}" alt="">${reward.coins} UT</strong><span>= &#8377;${reward.value}</span></button>`).join("")}</div>
          <div class="form-grid redeem-contact">
            <label class="full">Name<input data-redeem-name autocomplete="name" placeholder="Enter your name" required></label>
            <label class="full">Email ID<input data-redeem-email type="email" autocomplete="email" placeholder="Enter your active email" value="${escapeHtml(auth.currentUser.email || "")}" required></label>
            <div class="summary-box full" data-redeem-summary>Select a redeem value.</div>
            <button class="btn success full" type="button" data-review-redeem>Confirm</button>
          </div>
        </div>
        <div data-redeem-step="confirm" hidden>
          <div class="redeem-warning"><strong>Final confirmation</strong><p>UT Coins used for this redemption cannot be refunded. Please confirm your name, email, and selected value are correct.</p></div>
          <div class="summary-box" data-final-redeem-summary></div>
          <div class="redeem-final-actions"><button class="btn ghost" type="button" data-back-redeem>Go Back</button><button class="btn success" type="button" data-submit-redeem>Confirm and Redeem</button></div>
          <div class="error-msg" data-redeem-error></div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    let selected = null;
    const formStep = modal.querySelector('[data-redeem-step="form"]');
    const confirmStep = modal.querySelector('[data-redeem-step="confirm"]');
    const summary = modal.querySelector("[data-redeem-summary]");
    const finalSummary = modal.querySelector("[data-final-redeem-summary]");
    const error = modal.querySelector("[data-redeem-error]");
    const name = modal.querySelector("[data-redeem-name]");
    const email = modal.querySelector("[data-redeem-email]");

    modal.querySelector("[data-close-redeem]").addEventListener("click", () => modal.remove());
    modal.querySelectorAll("[data-reward-index]").forEach((option) => option.addEventListener("click", () => {
      selected = rewards[Number(option.dataset.rewardIndex)];
      modal.querySelectorAll(".redeem-option").forEach((node) => node.classList.toggle("selected", node === option));
      summary.textContent = `${selected.coins} UT Coins for a Google Playstore redeem code worth INR ${selected.value}.`;
    }));
    modal.querySelector("[data-review-redeem]").addEventListener("click", () => {
      if (!selected) { alert("Please select a redeem value."); return; }
      if (!name.value.trim()) { name.focus(); return; }
      if (!emailValid(email.value.trim())) { email.focus(); return; }
      if (visibleBalance < selected.coins) { alert("You do not have enough UT Coins for this reward."); return; }
      finalSummary.textContent = `${name.value.trim()} | ${email.value.trim()} | ${selected.coins} UT Coins | Google Playstore code INR ${selected.value}`;
      formStep.hidden = true;
      confirmStep.hidden = false;
    });
    modal.querySelector("[data-back-redeem]").addEventListener("click", () => { confirmStep.hidden = true; formStep.hidden = false; });
    modal.querySelector("[data-submit-redeem]").addEventListener("click", async (event) => {
      const submit = event.currentTarget;
      if (!auth.currentUser || !selected) {
        error.textContent = "Your login session or reward selection is missing. Please close this window and try again.";
        return;
      }
      submit.disabled = true;
      submit.textContent = "Submitting...";
      error.textContent = "";
      const uid = auth.currentUser.uid;
      const pointsRef = dbRef(database, `users/${uid}/points`);
      try {
        const pointsSnapshot = await withTimeout(get(pointsRef), "Could not check your UT Coin balance. Please try again.", 12000);
        const currentBalance = Number(pointsSnapshot.val()) || 0;
        if (currentBalance < selected.coins) throw new Error("You do not have enough UT Coins.");

        const redemptionRef = push(dbRef(database, "redemptions"));
        const updates = {};
        updates[`users/${uid}/points`] = currentBalance - selected.coins;
        updates[`users/${uid}/pointsUpdatedAt`] = serverTimestamp();
        updates[`redemptions/${redemptionRef.key}`] = {
          uid,
          accountEmail: auth.currentUser.email || "",
          name: name.value.trim(),
          email: email.value.trim(),
          reward: "Google Playstore Redeem Code",
          coinsUsed: selected.coins,
          redeemValue: selected.value,
          status: "Pending Verification",
          redeemCode: "Pending",
          createdAt: serverTimestamp()
        };
        await withTimeout(update(dbRef(database), updates), "Firebase could not save the redemption. Check your Realtime Database rules and try again.", 15000);
        currentProfileCache = null;
        await refreshPoints();
        modal.querySelector(".redeem-panel").innerHTML = `<div class="success-icon">&#10003;</div><h2>Redemption Submitted</h2><p class="muted">Your Google Playstore redeem-code request is pending. We will send it to ${escapeHtml(email.value.trim())} after verification.</p><button class="btn success full" type="button" data-finish-redeem>Done</button>`;
        modal.querySelector("[data-finish-redeem]").addEventListener("click", () => modal.remove());
      } catch (redeemError) {
        error.textContent = friendlyError(redeemError);
        console.error("Redemption submission failed", redeemError);
      } finally {
        if (document.body.contains(submit)) {
          submit.disabled = false;
          submit.textContent = "Confirm and Redeem";
        }
      }
    });
  });
}

function showOrderSubmittedPopup() {
  const modal = document.createElement("div");
  modal.className = "modal open";
  modal.dataset.orderSubmitted = "";
  modal.innerHTML = `
    <div class="modal-panel success-panel">
      <div class="success-icon">✓</div>
      <h2>Order Submitted</h2>
      <p class="muted">Your order status is Pending Verification. We will verify your payment proof and process your topup.</p>
      <button class="btn success full" type="button" data-your-orders>View Your Orders</button>
      <button class="btn ghost full" type="button" data-close-success>Close</button>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("[data-close-success]").addEventListener("click", () => modal.remove());
  modal.querySelector("[data-your-orders]").addEventListener("click", () => {
    modal.remove();
    showYourOrdersModal();
  });
}

function statusClass(status) {
  return normalizedOrderStatus(status).toLowerCase().replace(/[^a-z]+/g, "-");
}

function normalizedOrderStatus(status) {
  const value = String(status || "Pending Verification").trim();
  if (/^(complete|completed|success)$/i.test(value)) return "Completed";
  if (/^payment verified$/i.test(value)) return "Payment Verified";
  if (/^reject(ed)?$/i.test(value)) return "Rejected";
  if (/^pending$/i.test(value)) return "Pending Verification";
  return value;
}

function configuredOrderPoints(order) {
  const configured = Number(order?.pointsEarned);
  if (Number.isFinite(configured) && configured >= 0) return Math.floor(configured);
  return Math.floor(Math.max(0, Number(order?.amount) || 0) * POINTS_PER_RUPEE);
}

function totalPointsFromSnapshots(ordersSnapshot, redemptionsSnapshot, uid) {
  let earned = 0;
  ordersSnapshot?.forEach((child) => {
    const order = child.val();
    if (order?.uid === uid && normalizedOrderStatus(order?.status) === "Completed") {
      earned += configuredOrderPoints(order);
    }
  });
  let redeemed = 0;
  redemptionsSnapshot?.forEach((child) => {
    const redemption = child.val();
    if (redemption?.uid === uid && normalizedOrderStatus(redemption?.status) !== "Rejected") {
      redeemed += Math.max(0, Number(redemption.coinsUsed) || 0);
    }
  });
  return Math.max(0, earned - redeemed);
}

async function saveCalculatedPoints(uid, points) {
  const pointsRef = dbRef(database, `users/${uid}/points`);
  const saved = await get(pointsRef).catch(() => null);
  if (saved?.exists() && Number(saved.val()) === points) return;
  await update(dbRef(database, `users/${uid}`), {
    points,
    pointsUpdatedAt: serverTimestamp()
  });
}

async function calculateUserPoints(uid) {
  if (!uid) return 0;
  const [ordersSnapshot, redemptionsSnapshot] = await Promise.all([
    get(query(dbRef(database, "orders"), orderByChild("uid"), equalTo(uid))),
    get(query(dbRef(database, "redemptions"), orderByChild("uid"), equalTo(uid)))
  ]);
  const points = totalPointsFromSnapshots(ordersSnapshot, redemptionsSnapshot, uid);
  await saveCalculatedPoints(uid, points).catch((error) => console.warn("Could not save calculated UT Coins", error));
  return points;
}

function startLivePointsSync(user) {
  if (stopPointsOrders) stopPointsOrders();
  if (stopPointsRedemptions) stopPointsRedemptions();
  stopPointsOrders = null;
  stopPointsRedemptions = null;
  if (!user) return;

  let ordersSnapshot = null;
  let redemptionsSnapshot = null;
  const sync = async () => {
    if (!ordersSnapshot || !redemptionsSnapshot || auth.currentUser?.uid !== user.uid) return;
    const points = totalPointsFromSnapshots(ordersSnapshot, redemptionsSnapshot, user.uid);
    document.querySelectorAll("[data-points]").forEach((node) => { node.innerHTML = pointsMarkup(points); });
    if (currentProfileCache?.uid === user.uid) currentProfileCache.points = points;
    await saveCalculatedPoints(user.uid, points).catch((error) => console.warn("Could not sync UT Coins", error));
  };
  stopPointsOrders = onValue(
    query(dbRef(database, "orders"), orderByChild("uid"), equalTo(user.uid)),
    (snapshot) => { ordersSnapshot = snapshot; sync(); },
    (error) => console.warn("UT Coin order sync failed", error)
  );
  stopPointsRedemptions = onValue(
    query(dbRef(database, "redemptions"), orderByChild("uid"), equalTo(user.uid)),
    (snapshot) => { redemptionsSnapshot = snapshot; sync(); },
    (error) => console.warn("UT Coin redemption sync failed", error)
  );
}

async function recalculateUserPoints(uid) {
  if (!uid) return;
  const snapshot = await get(dbRef(database, "orders"));
  let total = 0;
  snapshot.forEach((child) => {
    const order = child.val();
    if (order?.uid === uid && normalizedOrderStatus(order?.status) === "Completed") {
      total += configuredOrderPoints(order);
    }
  });
  const redemptionsSnapshot = await get(dbRef(database, "redemptions"));
  let redeemed = 0;
  redemptionsSnapshot.forEach((child) => {
    const redemption = child.val();
    if (redemption?.uid === uid && redemption?.status !== "Rejected") redeemed += Number(redemption.coinsUsed) || 0;
  });
  await update(dbRef(database, `users/${uid}`), {
    points: Math.max(0, total - redeemed),
    pointsUpdatedAt: serverTimestamp()
  });
  if (auth.currentUser?.uid === uid) {
    currentProfileCache = null;
    await refreshPoints();
  }
}

async function showYourOrdersModal() {
  await authReady;
  if (!auth.currentUser) {
    window.location.href = "login.html";
    return;
  }
  const oldModal = document.querySelector("[data-your-orders-modal]");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.className = "modal open";
  modal.dataset.yourOrdersModal = "";
  modal.innerHTML = `
    <div class="modal-panel orders-panel">
      <div class="modal-head">
        <div>
          <h2>Your Orders</h2>
          <p class="muted">Orders connected to your logged-in account or email are shown here.</p>
        </div>
        <button class="icon-btn" data-close-orders aria-label="Close">x</button>
      </div>
      <div class="orders-list" data-your-orders-list>
        <div class="notice">Loading your orders...</div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const list = modal.querySelector("[data-your-orders-list]");
  const currentUid = auth.currentUser.uid;
  const currentEmail = (auth.currentUser.email || "").toLowerCase();
  let remoteOrders = [];
  let uidRedemptions = [];
  let emailRedemptions = [];
  let stopOrders = null;
  let stopUidRedemptions = null;
  let stopEmailRedemptions = null;
  let refreshTimer = null;
  const closeOrders = () => {
    if (stopOrders) stopOrders();
    if (stopUidRedemptions) stopUidRedemptions();
    if (stopEmailRedemptions) stopEmailRedemptions();
    if (refreshTimer) clearInterval(refreshTimer);
    modal.remove();
  };
  modal.querySelector("[data-close-orders]").addEventListener("click", closeOrders);

  const renderHistory = () => {
    const byId = new Map();
    [...readLocalOrders(), ...remoteOrders].forEach((order) => {
      const id = order.id || order.paymentReference || `${order.createdAt || ""}-${order.utr || ""}`;
      if (!id) return;
      byId.set(id, { ...order, id });
    });
    const orders = [...byId.values()].filter((order) => {
      const accountEmail = String(order.accountEmail || "").toLowerCase();
      const customerEmail = String(order.customerEmail || "").toLowerCase();
      return order.uid === currentUid || accountEmail === currentEmail || customerEmail === currentEmail;
    });
    orders.sort((a, b) => Number(b.createdAt || b.updatedAt || 0) - Number(a.createdAt || a.updatedAt || 0));
    const redemptionMap = new Map();
    [...emailRedemptions, ...uidRedemptions].forEach((redemption) => {
      if (redemption.id) redemptionMap.set(redemption.id, redemption);
    });
    const redemptions = [...redemptionMap.values()]
      .filter((redemption) => {
        const accountEmail = String(redemption.accountEmail || redemption.email || "").toLowerCase();
        return redemption.uid === currentUid || accountEmail === currentEmail;
      })
      .map((redemption) => ({ ...redemption, historyType: "redemption" }));
    const history = [
      ...orders.map((order) => ({ ...order, historyType: "order" })),
      ...redemptions
    ].sort((a, b) => Number(b.createdAt || b.updatedAt || 0) - Number(a.createdAt || a.updatedAt || 0));

    if (!history.length) {
      list.innerHTML = '<div class="notice">No orders yet.</div>';
      return;
    }
    const redemptionCode = (order) => {
      const savedCode = String(order.redeemCode || "").trim();
      const legacyValue = String(order.reward || "").trim();
      const legacyCode = legacyValue && !/google\s*play(?:store)?\s*(?:redeem\s*)?(?:code)?/i.test(legacyValue)
        ? legacyValue
        : "";
      const code = savedCode || legacyCode;
      return code && !/^(pending|not assigned)$/i.test(code) ? code : "Waiting for redeem code";
    };
    list.innerHTML = history.map((order) => order.historyType === "redemption" ? `
      <article class="user-order-card redemption-order-card">
        <div class="redemption-order-copy">
          <strong>Google Playstore Redeem Code</strong>
          <span>${Number(order.coinsUsed) || 0} UT Coins | Value INR ${Number(order.redeemValue) || 0}</span>
          <small>Delivery email: ${escapeHtml(order.email || order.accountEmail || "")}</small>
          <div class="redeem-code-space">
            <span>Redeem code</span>
            <strong>${escapeHtml(redemptionCode(order))}</strong>
          </div>
        </div>
        <span class="status-badge ${statusClass(order.status)}">${escapeHtml(normalizedOrderStatus(order.status))}</span>
      </article>
    ` : `
      <article class="user-order-card">
        <div>
          <strong>${escapeHtml(order.game || "")} - ${escapeHtml(order.bundle || "")}</strong>
          <span>${money(order.amount || 0)} | ${escapeHtml(order.playerId || "No game ID required")}</span>
          <small>UTR: ${escapeHtml(order.utr || "")} | UT Coins: ${Number(order.pointsEarned) || 0}</small>
          ${isDigitalKeyOrder(order) ? `<div class="redeem-code-space game-key-space"><span>Your Game Key</span><strong>${escapeHtml(order.gameKey && !/^(pending|not assigned)$/i.test(String(order.gameKey).trim()) ? order.gameKey : "Waiting for game key")}</strong></div>` : ""}
        </div>
        <span class="status-badge ${statusClass(order.status)}">${escapeHtml(normalizedOrderStatus(order.status))}</span>
      </article>
    `).join("");
  };
  renderHistory();
  const applyOrdersSnapshot = (snapshot) => {
    remoteOrders = [];
    snapshot.forEach((child) => {
      const order = { id: child.key, ...child.val() };
      remoteOrders.push(order);
      if (isDigitalKeyOrder(order) && (!order.deliveryType || !Object.prototype.hasOwnProperty.call(order, "gameKey"))) {
        update(dbRef(database, `orders/${child.key}`), {
          deliveryType: "gameKey",
          gameKey: order.gameKey || "Pending"
        }).catch((error) => console.warn("Could not repair game-key order", error));
      }
    });
    renderHistory();
  };
  const userOrdersQuery = query(dbRef(database, "orders"), orderByChild("uid"), equalTo(currentUid));
  stopOrders = onValue(userOrdersQuery, applyOrdersSnapshot, (error) => {
    list.innerHTML = `<div class="notice">${escapeHtml(readableOrderError(error))}</div>`;
  });
  const refreshOrders = async () => {
    try {
      applyOrdersSnapshot(await get(userOrdersQuery));
    } catch (error) {
      console.warn("Could not refresh orders", error);
    }
  };
  refreshTimer = setInterval(refreshOrders, 5000);
  const userRedemptionsQuery = query(dbRef(database, "redemptions"), orderByChild("uid"), equalTo(currentUid));
  stopUidRedemptions = onValue(userRedemptionsQuery, (snapshot) => {
    uidRedemptions = [];
    snapshot.forEach((child) => uidRedemptions.push({ id: child.key, ...child.val() }));
    renderHistory();
  }, (error) => {
    console.error("Could not load redemptions by UID", error);
  });
  if (currentEmail) {
    const emailRedemptionsQuery = query(dbRef(database, "redemptions"), orderByChild("accountEmail"), equalTo(currentEmail));
    stopEmailRedemptions = onValue(emailRedemptionsQuery, (snapshot) => {
      emailRedemptions = [];
      snapshot.forEach((child) => emailRedemptions.push({ id: child.key, ...child.val() }));
      renderHistory();
    }, (error) => {
      console.error("Could not load redemptions by email", error);
    });
  }
}

export async function initAdminPage() {
  const body = document.querySelector("[data-admin-orders]");
  const notice = document.querySelector("[data-admin-notice]");
  if (!body) return;
  await authReady;
  const user = auth.currentUser;
  const email = (user?.email || "").toLowerCase();
  if (!user) {
    notice.textContent = "Please login with admin Gmail to view orders.";
    body.innerHTML = "";
    return;
  }
  if (!TopupData.adminEmails.includes(email)) {
    notice.textContent = "This account is not allowed to open admin orders.";
    body.innerHTML = "";
    return;
  }
  notice.textContent = "Loading orders...";
  const statuses = ["Pending Verification", "Payment Verified", "Completed", "Rejected"];
  onValue(dbRef(database, "orders"), (snapshot) => {
    const orders = [];
    snapshot.forEach((child) => orders.push({ id: child.key, ...child.val() }));
    orders.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    notice.textContent = orders.length ? `${orders.length} orders found.` : "No orders found.";
    body.innerHTML = orders.map((order) => `
      <tr>
        <td>${escapeHtml(order.playerId || "Not required")}</td>
        <td>${escapeHtml(order.username || "")}</td>
        <td>${escapeHtml(order.game || "")}</td>
        <td>${escapeHtml(order.bundle || "")}</td>
        <td>${money(order.amount || 0)}</td>
        <td>${escapeHtml(order.utr || "")}</td>
        <td>${order.screenshotUrl ? `<a href="${escapeHtml(order.screenshotUrl)}" target="_blank" rel="noopener">View Screenshot</a>` : "No screenshot"}</td>
        <td>
          <select data-admin-status="${escapeHtml(order.id)}">
            ${statuses.map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </td>
      </tr>
    `).join("");
    body.querySelectorAll("[data-admin-status]").forEach((select) => {
      select.addEventListener("change", async () => {
        select.disabled = true;
        const orderId = select.dataset.adminStatus;
        try {
          const newStatus = select.value;
          await update(dbRef(database, `orders/${orderId}`), {
            status: newStatus,
            updatedAt: serverTimestamp(),
            updatedBy: email
          });
          const order = orders.find((item) => item.id === orderId);
          if (order?.uid && (newStatus === "Completed" || order.status === "Completed")) {
            await recalculateUserPoints(order.uid);
          }
        } catch (error) {
          alert(error.message || "Could not update order status.");
        } finally {
          select.disabled = false;
        }
      });
    });
  }, (error) => {
    notice.textContent = error.message || "Could not load orders.";
  });
}


