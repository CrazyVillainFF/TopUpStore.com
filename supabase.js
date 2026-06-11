/**
 * Supabase client module for Unlimited Topup.
 * Dual-writes data to Supabase alongside Firebase.
 * All Supabase writes are fire-and-forget — if they fail,
 * Firebase continues to work and the user experience is unaffected.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://lacvojqavgsrrgftergg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qHgQqiXvHmrWngX6DZQ6tw_mN-H5z-W";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Upsert a user profile in Supabase.
 * Called after Firebase profile creation/load.
 * Uses firebase_uid as the conflict target so existing rows are updated.
 */
export async function supabaseEnsureUserProfile(firebaseUser, profile) {
  try {
    const row = {
      firebase_uid: firebaseUser.uid,
      username: profile?.username || firebaseUser.displayName || firebaseUser.email.split("@")[0],
      username_lower: (profile?.username || firebaseUser.displayName || firebaseUser.email.split("@")[0]).toLowerCase(),
      email: firebaseUser.email,
      points: Number(profile?.points) || 0,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("users")
      .upsert(row, { onConflict: "firebase_uid" });

    if (error) throw error;
    console.log("[Supabase] User profile synced:", row.username);
  } catch (err) {
    console.warn("[Supabase] User profile sync failed (Firebase still OK):", err.message || err);
  }
}

/**
 * Save an order to Supabase.
 * Called after Firebase order write succeeds.
 */
export async function supabaseSaveOrder(order, firebaseUid, profile) {
  try {
    const row = {
      firebase_uid: firebaseUid,
      account_username: profile?.username || "",
      email: profile?.email || "",
      username: order.username,
      game: order.game,
      item: order.item,
      bundle: order.bundle,
      player_id: order.playerId,
      phone: order.phone || "Not provided",
      amount: Number(order.amount),
      points_earned: Math.floor(Number(order.amount) * 4),
      status: "pending_payment"
    };

    const { error } = await supabase.from("orders").insert(row);
    if (error) throw error;
    console.log("[Supabase] Order saved:", row.game, row.bundle);
  } catch (err) {
    console.warn("[Supabase] Order save failed (Firebase still OK):", err.message || err);
  }
}

/**
 * Save a redemption record to Supabase.
 * Called after Firebase redemption write succeeds.
 */
export async function supabaseSaveRedemption(firebaseUid, username, pointsRedeemed, topupCredit) {
  try {
    const row = {
      firebase_uid: firebaseUid,
      username,
      points_redeemed: pointsRedeemed,
      topup_credit: topupCredit
    };

    const { error } = await supabase.from("redemptions").insert(row);
    if (error) throw error;
    console.log("[Supabase] Redemption saved:", pointsRedeemed, "pts →", topupCredit, "INR");
  } catch (err) {
    console.warn("[Supabase] Redemption save failed (Firebase still OK):", err.message || err);
  }
}

/**
 * Update user points in Supabase after a redemption.
 * Decrements points by the redeemed amount.
 */
export async function supabaseUpdatePoints(firebaseUid, pointsToSubtract) {
  try {
    // First get current points
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("points")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (fetchError) throw fetchError;

    const newPoints = Math.max(0, (data?.points || 0) - pointsToSubtract);

    const { error: updateError } = await supabase
      .from("users")
      .update({ points: newPoints, updated_at: new Date().toISOString() })
      .eq("firebase_uid", firebaseUid);

    if (updateError) throw updateError;
    console.log("[Supabase] Points updated:", newPoints, "pts remaining");
  } catch (err) {
    console.warn("[Supabase] Points update failed (Firebase still OK):", err.message || err);
  }
}
