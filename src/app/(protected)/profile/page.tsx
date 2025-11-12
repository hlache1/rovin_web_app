"use client"

import React from "react";
import { useUser } from "@/hooks/useUser";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";


export default function ProfilePage() {
  const { user, profile, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Perfil
        </h3>
        <div className="space-y-6">
          <UserMetaCard 
            first_name={profile?.first_name || ""} 
            last_name={profile?.last_name || ""}
            email={user?.email || ""}
        />
          <UserInfoCard 
            id={profile?.id}
            first_name={profile?.first_name || ""} 
            last_name={profile?.last_name || ""}
            phone={profile?.phone || ""}
            email={user?.email || ""}
          />
        </div>
      </div>
    </div>
  );
}
