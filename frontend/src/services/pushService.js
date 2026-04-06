/**
 * pushService.js
 *
 * Manages Web Push subscription lifecycle in the browser:
 *   1. Registers the service worker (sw.js)
 *   2. Requests the VAPID public key from the backend
 *   3. Subscribes the browser to push messages
 *   4. Saves the subscription to the backend
 *   5. Handles SW → app navigation messages
 *
 * Usage:
 *   import { initPush, disablePush, isPushSupported } from './pushService'
 *   await initPush()        // call once after login
 *   await disablePush()     // call on logout
 */

import { subscribePush, unsubscribePush, getVapidPublicKey } from './api'

const SW_PATH = '/sw.js'

export function isPushSupported() {
  return (
    'serviceWorker' in navigator &&
    'PushManager'   in window &&
    'Notification'  in window
  )
}

/** Convert a base64 VAPID public key to a Uint8Array for PushManager.subscribe */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

let _swRegistration = null

/**
 * Register the SW and set up the navigation-message listener.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
async function ensureSW(navigate) {
  if (_swRegistration) return _swRegistration

  _swRegistration = await navigator.serviceWorker.register(SW_PATH)

  // Listen for NAVIGATE messages from the SW (notification click)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NAVIGATE' && navigate) {
      navigate(event.data.link)
    }
  })

  return _swRegistration
}

/**
 * Enable push notifications for the currently logged-in user.
 *
 * @param {Function} navigate - react-router navigate() for SW click-through
 * @returns {boolean} true if subscription succeeded, false otherwise
 */
export async function initPush(navigate) {
  if (!isPushSupported()) return false

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    // 2. Register SW
    const registration = await ensureSW(navigate)

    // 3. Get VAPID public key from backend
    const { public_key: vapidKey } = await getVapidPublicKey()
    if (!vapidKey) return false

    // 4. Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    // 5. Save to backend
    await subscribePush(subscription.toJSON())
    return true
  } catch (err) {
    console.warn('[pushService] initPush failed:', err)
    return false
  }
}

/**
 * Unsubscribe from push notifications (e.g. on logout).
 */
export async function disablePush() {
  if (!isPushSupported()) return

  try {
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH)
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    await unsubscribePush(sub.endpoint)
    await sub.unsubscribe()
  } catch (err) {
    console.warn('[pushService] disablePush failed:', err)
  }
}

/**
 * Check if the user is currently subscribed (for UI toggle state).
 * @returns {boolean}
 */
export async function isPushSubscribed() {
  if (!isPushSupported()) return false
  try {
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH)
    if (!reg) return false
    const sub = await reg.pushManager.getSubscription()
    return !!sub
  } catch {
    return false
  }
}
