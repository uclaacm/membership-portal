"use client";

import "./style.scss";

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-block skeleton-header" />
      <div className="skeleton-cards">
        <div className="skeleton-block skeleton-card" />
        <div className="skeleton-block skeleton-card" />
        <div className="skeleton-block skeleton-card" />
        <div className="skeleton-block skeleton-card" />
      </div>
    </div>
  );
}
