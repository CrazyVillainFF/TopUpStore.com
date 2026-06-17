import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getDatabase, ref as dbRef, push, serverTimestamp, onValue, update, set, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
const supabaseUrl = "https://lacvojqavgsrrgftergg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhY3ZvanFhdmdzcnJnZnRlcmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzcyMjcsImV4cCI6MjA5NjcxMzIyN30.rjLVEPIjMAkc2zT3_0569oO5oXw-KZ0sdPb5aYvgpJM";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TopupData = {
  upiId: "7667107386@ptyes",
  paymentQr: "payment-qr.jpg",
  cloudinaryCloudName: "dbctbgoum",
  cloudinaryUploadPreset: "UnlimitedTopUpo",
  adminEmails: ["unlimitedtopup001@gmail.com", "vishnubangaru001@gmail.com"],
  games: {
    freefire: { name: "Free Fire", item: "Diamonds", logo: "freefire.svg.png", page: "freefire.html", description: "Fast diamond packs and memberships for Free Fire accounts with UPI checkout.", bundles: [{ label: "100 Diamonds", amount: 79 }, { label: "310 Diamonds", amount: 240 }, { label: "520 Diamonds", amount: 399 }, { label: "1060 Diamonds", amount: 799 }, { label: "Weekly Membership", amount: 159 }, { label: "Monthly Membership", amount: 799 }] },
    bgmi: { name: "BGMI", item: "UC", logo: "bgmi.svg.jpg", page: "bgmi.html", description: "Reliable BGMI UC packs with Supabase order tracking.", bundles: [{ label: "60 UC", amount: 75 }, { label: "325 UC", amount: 380 }, { label: "660 UC", amount: 750 }, { label: "1800 UC", amount: 1850 }] },
    pubg: { name: "PUBG Mobile", item: "UC", logo: "pubg.svg.png", page: "pubg.html", description: "PUBG Mobile UC bundles with a clear payment summary before checkout.", bundles: [{ label: "60 UC", amount: 75 }, { label: "325 UC", amount: 380 }, { label: "660 UC", amount: 750 }, { label: "1800 UC", amount: 1850 }] },
    cod: { name: "Call of Duty Mobile", item: "CP", logo: "cod.svg.png", page: "cod.html", description: "CP bundles for Call of Duty Mobile with clear checkout steps.", bundles: [{ label: "80 CP", amount: 79 }, { label: "420 CP", amount: 399 }, { label: "880 CP", amount: 799 }, { label: "2400 CP", amount: 1999 }] },
    minecraft: { name: "Minecraft", item: "Minecoins", logo: "https://thumbs.dreamstime.com/b/minecraft-logo-online-game-dirt-block-illustrations-concept-design-isolated-186775550.jpg", page: "minecraft.html", description: "Minecraft Minecoins packs with simple checkout. No game ID number required.", noGameId: true, bundles: [{ label: "1720 Minecoins", amount: 680, originalAmount: 735 }, { label: "3500 Minecoins", amount: 1389, originalAmount: 1457 }] }
  }
};

let currentUser = undefined;
let currentProfileCache = null;
export const authReady = new Promise((resolve) => onAuthStateChanged(auth, (user) => { currentUser = user; resolve(user); }));
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  currentProfileCache = null;
  updateHeaderFromAuth();
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
  if (code === "permission-denied") return "Supabase permission denied. Check table policies.";
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
  currentProfileCache = { uid: user.uid, username, email: user.email, points: 0 };
  return currentProfileCache;
}
export async function createAccount(username, email, password) {
  try {
    const credential = await withTimeout(createUserWithEmailAndPassword(auth, email, password), "Signup timed out. Check Email/Password provider.");
    await updateProfile(credential.user, { displayName: username });
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
    const credential = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(credential.user);
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
    const profile = await currentProfile();
    return profile ? Number(profile.points) || 0 : 0;
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
  const pointsEarned = Math.floor(Number(order.amount) * 4);
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
    paymentReference: order.reference,
    status: "Pending Verification",
    createdAt: serverTimestamp()
  };
  try {
    await withTimeout(set(orderRef, baseOrder), "Could not save order in Firebase Realtime Database.");
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

function navHtml(active) {
  const nav = [["index", "Home", "index.html"], ["freefire", "Free Fire", "freefire.html"], ["bgmi", "BGMI", "bgmi.html"], ["pubg", "PUBG", "pubg.html"], ["cod", "Call of Duty", "cod.html"], ["minecraft", "Minecraft", "minecraft.html"]];
  return nav.map(([key, label, href]) => `<a class="${active === key ? "active" : ""}" href="${href}">${label}</a>`).join("");
}

function menuHtml(active, isLoggedIn = false) {
  const orders = isLoggedIn ? '<button type="button" class="menu-orders" data-your-orders>Your Orders</button>' : "";
  const logout = isLoggedIn ? '<button type="button" class="menu-logout" data-logout>Logout</button>' : "";
  return `<div class="mobile-menu-panel" data-mobile-menu>${navHtml(active)}${orders}${logout}</div>`;
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
  return `<div class="page-shell navbar"><button class="menu-toggle" type="button" data-menu-toggle aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button><a class="brand" href="index.html"><span class="brand-mark">UT</span><span class="brand-text"><strong>Unlimited Topup</strong><span>Supabase connected</span></span></a><nav class="nav-links desktop-nav">${navHtml(active)}</nav><div class="auth-area">${authHtml}</div>${menuHtml(active, isLoggedIn)}</div>`;
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

function authHtmlForUser(user, profile = null) {
  const label = profile?.username || user.displayName || user.email || "Profile";
  const email = user.email || "";
  const points = Number(profile?.points) || 0;
  return `<button class="btn ghost orders-btn" type="button" data-your-orders>Your Orders</button><div class="profile-chip">${profileAvatar(user, label)}<span class="profile-copy"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(email)}</small></span></div><span class="points-pill" data-points>${points} pts</span><button class="btn ghost" data-logout>Logout</button>`;
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
    .then((profile) => {
      if (!auth.currentUser || auth.currentUser.uid !== userForHeader.uid) return;
      header.innerHTML = headerShell(active, authHtmlForUser(userForHeader, profile));
      bindSignOut(header);
      bindYourOrders(header);
      bindMobileMenu(header);
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
  document.querySelectorAll("[data-points]").forEach((node) => { node.textContent = points + " pts"; });
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
  const offer = bundle.originalAmount ? `${discountPercent(bundle).toFixed(2)}% Minecraft offer` : apply ? `${discountPercent(bundle)}% offer applied` : "Standard price";
  const original = bundle.originalAmount ? ` | Original ${money(bundle.originalAmount)}` : "";
  return `${bundle.label}${original} | ${offer} | Total ${money(finalAmount)}`;
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
    title.textContent = `Order ${game.name} ${game.item}`;
    username.value = auth.currentUser?.displayName || ""; player.value = ""; customerEmail.value = auth.currentUser?.email || ""; offer.checked = true;
    player.closest("label").style.display = game.noGameId ? "none" : "";
    player.required = !game.noGameId;
    offer.closest("label").style.display = game.noGameId ? "none" : "";
    fillBundleSelect(bundle, currentKey); update(); modal.classList.add("open");
    (game.noGameId ? username : player).focus();
  }));
  modal.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => modal.classList.remove("open")));
  bundle.addEventListener("change", update); offer.addEventListener("change", update);
  pay.addEventListener("click", async () => {
    if (!currentKey) return;
    const game = TopupData.games[currentKey];
    if (!username.value.trim()) { alert("Please enter your game ID name."); username.focus(); return; }
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
  if (plans && !plans.children.length) plans.innerHTML = game.bundles.map((bundle, index) => `<article class="plan-card"><img src="${game.logo}" alt="${game.name} logo"><div><strong>${bundle.label}</strong><span>${bundle.originalAmount ? `<s>${money(bundle.originalAmount)}</s> ` : ""}${money(bundle.amount)}</span>${bundle.originalAmount ? `<small class="field-help">${discountPercent(bundle).toFixed(2)}% Minecraft offer</small>` : ""}</div><button class="btn ghost" data-select-plan="${index}">Select</button></article>`).join("");
  const form = document.querySelector("[data-game-form]");
  if (!form) return;
  const username = form.querySelector("[data-username]");
  const player = form.querySelector("[data-player-id]");
  const customerEmail = form.querySelector("[data-customer-email]");
  const bundle = form.querySelector("[data-bundle]");
  const offer = form.querySelector("[data-offer]");
  const summary = form.querySelector("[data-summary]");
  const submit = form.querySelector("button[type='submit']");
  if (submit) submit.textContent = "Continue to Manual Payment";
  if (game.noGameId && player) {
    player.closest("label").style.display = "none";
    player.required = false;
  }
  if (game.noGameId && offer) offer.closest("label").style.display = "none";
  fillBundleSelect(bundle, gameKey);
  const update = () => {
    if (bundle.value === "") { summary.textContent = "Select a bundle to calculate the final payable amount."; return; }
    const selected = game.bundles[Number(bundle.value)];
    summary.textContent = bundleSummary(selected, game.noGameId ? true : offer.checked);
  };
  bundle.addEventListener("change", update); offer.addEventListener("change", update);
  document.querySelectorAll("[data-select-plan]").forEach((button) => button.addEventListener("click", () => { bundle.value = button.dataset.selectPlan; update(); form.scrollIntoView({ behavior: "smooth", block: "center" }); }));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!(await requireLogin())) return;
    if (customerEmail && !customerEmail.value.trim()) customerEmail.value = auth.currentUser?.email || "";
    if (!username.value.trim()) { alert("Please enter your game ID name."); username.focus(); return; }
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
  button.addEventListener("click", () => {
    alert("Reward redeem will be enabled after Supabase points rules are configured.");
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
  return String(status || "Pending Verification").toLowerCase().replace(/[^a-z]+/g, "-");
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
          <p class="muted">Only orders from your logged-in account are shown here.</p>
        </div>
        <button class="icon-btn" data-close-orders aria-label="Close">x</button>
      </div>
      <div class="orders-list" data-your-orders-list>
        <div class="notice">Loading your orders...</div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("[data-close-orders]").addEventListener("click", () => modal.remove());
  const list = modal.querySelector("[data-your-orders-list]");
  const ownOrders = query(dbRef(database, "orders"), orderByChild("uid"), equalTo(auth.currentUser.uid));
  onValue(ownOrders, (snapshot) => {
    const orders = [];
    snapshot.forEach((child) => orders.push({ id: child.key, ...child.val() }));
    orders.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    if (!orders.length) {
      list.innerHTML = '<div class="notice">No orders yet.</div>';
      return;
    }
    list.innerHTML = orders.map((order) => `
      <article class="user-order-card">
        <div>
          <strong>${escapeHtml(order.game || "")} - ${escapeHtml(order.bundle || "")}</strong>
          <span>${money(order.amount || 0)} | ${escapeHtml(order.playerId || "No game ID required")}</span>
          <small>UTR: ${escapeHtml(order.utr || "")}</small>
        </div>
        <span class="status-badge ${statusClass(order.status)}">${escapeHtml(order.status || "Pending Verification")}</span>
      </article>
    `).join("");
  }, (error) => {
    list.innerHTML = `<div class="notice">${escapeHtml(readableOrderError(error))}</div>`;
  });
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
          await update(dbRef(database, `orders/${orderId}`), {
            status: select.value,
            updatedAt: serverTimestamp(),
            updatedBy: email
          });
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

