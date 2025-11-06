"use client";

import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSidebar } from "@/context/SidebarContext";
import { useRouter } from 'next/navigation';

import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";

export default function ProtectedLayout({ 
    children 
}: { children: ReactNode }) {
  const router = useRouter();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) router.push('/signin');

      setLoading(false);
    }
    checkUser();
  }, [router]);

  if (loading) return null;

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
