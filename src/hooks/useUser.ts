"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
};

export function useUser() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Cargar user
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      setLoading(true);
      try {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!mounted) return;
        setUser(userData?.user ?? null);
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();

    // suscripción a cambios de auth
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      try {
        if (sub && typeof (sub as any).subscription?.unsubscribe === "function") {
          (sub as any).subscription.unsubscribe();
        } else if (sub && typeof (sub as any).unsubscribe === "function") {
          (sub as any).unsubscribe();
        }
      } catch (e) {
        console.error("Error unsubscribing", e);
      }
    };
  }, []);

  // 2️⃣ Cargar profile y organization **cuando user ya existe**
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function loadProfileAndOrg() {
      try {
        // profile
        const { data: profileData, error: profileError } = await supabase
          .from("users_mirror")
          .select("id, phone, first_name, last_name")
          .eq("id", user?.id)
          .single();

        if (profileError) throw profileError;
        if (mounted) setProfile(profileData);

        // organization (user_organizations + organizations)
        // const { data: orgData, error: orgError } = await supabase
        //   .from("user_organizations")
        //   .select("id, organization_id, role, organization:organizations(id, name)")
        //   //.select("id, organization_id")
        //   .eq("user_id", user?.id);

        // if (orgError) throw orgError;
        // if (mounted) setOrganization(orgData ?? null);
      } catch (err) {
        if (mounted) {
          setProfile(null);
          setOrganization(null);
        }
      }
    }

    loadProfileAndOrg();

    return () => {
      mounted = false;
    };
  }, [user]); // 🔑 dependemos de user

  return { user, profile, organization, loading };
}
