"use client";

import React from "react";

export default function ContestIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="contest-detail-container">
      {children}
    </div>
  );
} 