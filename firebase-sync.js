import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signInWithRedirect, signOut } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { get, getDatabase, onChildAdded, onChildChanged, onChildRemoved, onValue, push, ref, remove, runTransaction, set, update } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAk81HxCeRB3IGekGcsE9OVHmi1sFdLwYM',
  authDomain: 'ajimaru-bcbef.firebaseapp.com',
  databaseURL: 'https://ajimaru-bcbef-default-rtdb.firebaseio.com',
  projectId: 'ajimaru-bcbef',
  storageBucket: 'ajimaru-bcbef.firebasestorage.app',
  messagingSenderId: '893250502168',
  appId: '1:893250502168:web:76740b65a9ca60953fcd6d',
  measurementId: 'G-H39ZKMVY25'
};

const STAFF_EMAIL = 'ajayatimilsina1@gmail.com';
const CUSTOMER_ORDER_KEYS = 'hh_customer_order_keys';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const ownOrders = new Map();
const customerListeners = new Set();
const watchedOrders = new Map();
const staffOrders = new Map();
let staffOrdersListener = null;

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function isStaff(user) {
  return Boolean(user && !user.isAnonymous && user.email?.toLowerCase() === STAFF_EMAIL);
}

function normalizeMenu(menu) {
  const values = (Array.isArray(menu) ? menu : Object.values(menu || {})).filter(item => item && typeof item === 'object');
  return values.map(item => ({
    id: Number(item.id),
    cat: String(item.cat || ''),
    n: String(item.n || ''),
    p: Number(item.p),
    e: String(item.e || ''),
    out: item.out === true,
    opts: (Array.isArray(item.opts) ? item.opts : Object.values(item.opts || {}))
      .filter(opt => opt && String(opt.n || '').trim())
      .map(opt => ({ n: String(opt.n), p: Number(opt.p) || 0 }))
  })).sort((a, b) => a.id - b.id);
}

function menuRecord(menu) {
  return Object.fromEntries(normalizeMenu(menu).map(item => [String(item.id), item]));
}

function customerOrderKeys() {
  try {
    const keys = JSON.parse(localStorage.getItem(CUSTOMER_ORDER_KEYS) || '[]');
    return Array.isArray(keys) ? keys.filter(key => typeof key === 'string') : [];
  } catch (error) {
    return [];
  }
}

function publishCustomerOrders() {
  const orders = [...ownOrders.values()].sort((a, b) => a.t - b.t);
  customerListeners.forEach(listener => listener(orders));
}

function watchCustomerOrder(key, uid) {
  if (watchedOrders.has(key)) return;
  const unsubscribe = onValue(ref(database, `orders/${key}`), snapshot => {
    const order = snapshot.val();
    if (order && order.customerUid === uid) ownOrders.set(key, { ...order, key });
    else ownOrders.delete(key);
    publishCustomerOrders();
  }, error => emit('firebase-sync-error', { message: error.message }));
  watchedOrders.set(key, unsubscribe);
}

async function ensureCustomer() {
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser;
}

async function startCustomer(onOrders) {
  customerListeners.add(onOrders);
  const user = await ensureCustomer();
  customerOrderKeys().forEach(key => watchCustomerOrder(key, user.uid));
  publishCustomerOrders();
  return () => customerListeners.delete(onOrders);
}

async function createCustomerOrder(order) {
  const user = await ensureCustomer();
  const orderRef = push(ref(database, 'orders'));
  const record = { ...order, customerUid: user.uid };
  await set(orderRef, record);
  const keys = customerOrderKeys();
  if (!keys.includes(orderRef.key)) {
    keys.push(orderRef.key);
    localStorage.setItem(CUSTOMER_ORDER_KEYS, JSON.stringify(keys));
  }
  watchCustomerOrder(orderRef.key, user.uid);
  return { ...record, key: orderRef.key };
}

async function signInStaff() {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  if (!isStaff(result.user)) {
    await signOut(auth);
    throw new Error(`Staff access is limited to ${STAFF_EMAIL}.`);
  }
  return result.user;
}

async function ensureMenu(defaultMenu) {
  if (!isStaff(auth.currentUser)) throw new Error('Staff sign-in required.');
  const menuRef = ref(database, 'menu');
  const snapshot = await get(menuRef);
  if (!snapshot.exists()) await set(menuRef, menuRecord(defaultMenu));
}

async function saveMenu(menu) {
  if (!isStaff(auth.currentUser)) throw new Error('Staff sign-in required.');
  await set(ref(database, 'menu'), menuRecord(menu));
}

async function saveSettings(settings) {
  if (!isStaff(auth.currentUser)) throw new Error('Staff sign-in required.');
  await set(ref(database, 'settings'), settings);
}

function normalizeStock(value) {
  const items = {};
  Object.entries(value?.items || {}).forEach(([id, rec]) => {
    if (rec && Number.isFinite(Number(rec.qty))) items[id] = { qty: Number(rec.qty), countedAt: Number(rec.countedAt) || 0, diff: Number(rec.diff) || 0 };
  });
  return items;
}

async function setStock(id, qty, counted) {
  if (!isStaff(auth.currentUser)) throw new Error('Staff sign-in required.');
  const q = Math.max(0, Math.floor(Number(qty)));
  if (!Number.isFinite(q)) throw new Error('Enter a valid quantity.');
  const prev = (await get(ref(database, `stock/items/${id}`))).val();
  const rec = counted
    ? { qty: q, countedAt: Date.now(), diff: q - (Number(prev?.qty) || 0) }
    : { qty: q, countedAt: Number(prev?.countedAt) || 0, diff: Number(prev?.diff) || 0 };
  const updates = { [`stock/items/${id}`]: rec };
  if (!(await get(ref(database, 'stock/since'))).exists()) updates['stock/since'] = Date.now();
  if (q === 0) updates[`menu/${id}/out`] = true;
  else if (prev && Number(prev.qty) === 0) updates[`menu/${id}/out`] = false;
  await update(ref(database), updates);
}

async function untrackStock(id) {
  if (!isStaff(auth.currentUser)) throw new Error('Staff sign-in required.');
  await remove(ref(database, `stock/items/${id}`));
}

async function applyOrderStock(order) {
  if (!isStaff(auth.currentUser) || !order?.key || order.stockApplied) return;
  const since = Number((await get(ref(database, 'stock/since'))).val()) || 0;
  if (!since || Number(order.t) < since) return;
  const flag = await runTransaction(ref(database, `orders/${order.key}/stockApplied`), cur => (cur === true ? undefined : true));
  if (!flag.committed) return;
  const need = {};
  Object.values(order.items || {}).forEach(item => {
    if (item && Number.isFinite(Number(item.mid))) need[item.mid] = (need[item.mid] || 0) + (Number(item.q) || 0);
  });
  for (const [mid, q] of Object.entries(need)) {
    const result = await runTransaction(ref(database, `stock/items/${mid}`), cur => (cur && Number.isFinite(Number(cur.qty)) ? { ...cur, qty: Math.max(0, Number(cur.qty) - q) } : undefined));
    if (result.committed && result.snapshot.val()?.qty === 0) await update(ref(database, `menu/${mid}`), { out: true });
  }
}

async function signInCustomer() {
  const provider = new GoogleAuthProvider();
  try {
    return (await signInWithPopup(auth, provider)).user;
  } catch (error) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(error.code)) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

onValue(ref(database, 'settings'), snapshot => {
  emit('firebase-settings', { settings: snapshot.val() || {} });
}, error => emit('firebase-sync-error', { message: error.message }));

onValue(ref(database, 'menu'), snapshot => {
  emit('firebase-menu', { menu: snapshot.exists() ? normalizeMenu(snapshot.val()) : null });
}, error => emit('firebase-sync-error', { message: error.message }));

let stockListener = null;
function listenForStock(user) {
  if (!isStaff(user) || stockListener) return;
  stockListener = onValue(ref(database, 'stock'), snapshot => {
    emit('firebase-stock', { stock: normalizeStock(snapshot.val()) });
  }, error => emit('firebase-sync-error', { message: error.message }));
}

function listenForStaffOrders(user) {
  if (!isStaff(user) || staffOrdersListener) return;
  const ordersRef = ref(database, 'orders');
  const publish = () => emit('firebase-orders', {
    orders: [...staffOrders.values()].sort((a, b) => a.t - b.t)
  });
  const handleError = error => emit('firebase-sync-error', { message: error.message });
  const stopAdded = onChildAdded(ordersRef, snapshot => {
    staffOrders.set(snapshot.key, { ...snapshot.val(), key: snapshot.key });
    publish();
  }, handleError);
  const stopChanged = onChildChanged(ordersRef, snapshot => {
    staffOrders.set(snapshot.key, { ...snapshot.val(), key: snapshot.key });
    publish();
  }, handleError);
  const stopRemoved = onChildRemoved(ordersRef, snapshot => {
    staffOrders.delete(snapshot.key);
    publish();
  }, handleError);
  staffOrdersListener = () => {
    stopAdded();
    stopChanged();
    stopRemoved();
    staffOrders.clear();
  };
}

onAuthStateChanged(auth, user => {
  const staff = isStaff(user);
  if (staff) listenForStock(user);
  else if (stockListener) {
    stockListener();
    stockListener = null;
  }
  if (staff) listenForStaffOrders(user);
  else if (staffOrdersListener) {
    staffOrdersListener();
    staffOrdersListener = null;
  }
  emit('firebase-auth-changed', {
    isStaff: staff,
    email: staff ? user.email : '',
    signedIn: Boolean(user && !user.isAnonymous),
    userEmail: user && !user.isAnonymous ? user.email || '' : '',
    displayName: user && !user.isAnonymous ? user.displayName || '' : ''
  });
});

window.firebaseSync = {
  createCustomerOrder,
  ensureMenu,
  saveMenu,
  saveSettings,
  setStock,
  untrackStock,
  applyOrderStock,
  signInCustomer,
  signInStaff,
  signOut: () => signOut(auth),
  updateOrder: (key, patch) => update(ref(database, `orders/${key}`), patch),
  deleteOrder: key => remove(ref(database, `orders/${key}`)),
  startCustomer
};

emit('firebase-sync-ready', {});
