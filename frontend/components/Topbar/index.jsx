"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import NavigationItem from "./NavigationItem";
import ProfileDropdown from "./ProfileDropdown";
import AppLauncher from "./AppLauncher";
import useCycleState from "@/lib/hooks/useCycleState";
import Config from "@/lib/config";
import "./styles.scss";

export default function Topbar({
  picture,
  onLogout,
  isRealAdmin,
  isOfficer,
  cycle,
}) {
  // Sourced here rather than threaded from every page: the topbar is on every screen, and a
  // caller that forgot the prop made the launcher assert "Applications closed".
  const loadedCycle = useCycleState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  // Three constant items. The bar no longer changes shape by role — Internship, Career Hub and
  // the Control Panel moved behind the launcher, and Leaderboard is gone with its page.
  const sharedLinks = (
    <>
      <Link href="/home" className={pathname === "/home" ? "selected" : ""}>
        <NavigationItem text="Home" />
      </Link>
      <Link href="/events" className={pathname === "/events" ? "selected" : ""}>
        <NavigationItem text="Events" />
      </Link>
      <Link href="/resources" className={pathname === "/resources" ? "selected" : ""}>
        <NavigationItem text="Organization" />
      </Link>
    </>
  );

  return (
    <div className="topbar">
      <div className="topbar-container">
        <div className="topbar-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/new_acm_wordmark_chapter.png" alt={Config.organization.name} />
        </div>

        <div className={`topbar-links ${menuOpen ? "open" : ""}`}>
          {sharedLinks}
        </div>

        {/* Hamburger Button (Mobile only) */}
        <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={toggleMenu}>
          <i className={`fa ${menuOpen ? "fa-times" : "fa-bars"}`} />
        </div>

        {/* Right cluster: launcher then avatar, both fixed width. Opening one closes the other. */}
        <div className="topbar-actions">
          <AppLauncher
            open={launcherOpen}
            onToggle={() => setLauncherOpen((v) => !v)}
            onClose={() => setLauncherOpen(false)}
            staff={isRealAdmin || isOfficer}
            cycle={cycle ?? loadedCycle}
          />

          <ProfileDropdown
            picture={picture}
            onLogout={onLogout}
            onOpen={() => setLauncherOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
