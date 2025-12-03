"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useUpdateOrganization() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function updateOrganizationData(
        userId: string, organizationId: string, name: string | null, role: string | null
    ) {
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (name) {
            const { error: nameError } = await supabase
                .from("organizations")
                .update({ name })
                .eq("id", organizationId);

            if (nameError) {
                setLoading(false);
                setError(nameError.message);
                return { success: false, error: nameError };
            }

        }

        if (role) {
            const { error: roleError } = await supabase
                .from("user_organizations")
                .update({ role })
                .eq("user_id", userId)
                .eq("organization_id", organizationId);

            if (roleError) {
                setLoading(false);
                setError(roleError.message);
                return { success: false, error: roleError };
            }
        }

        setLoading(false);
        setSuccess(true);
        return { success: true };
    }

    return { updateOrganizationData, loading, error, success };
}