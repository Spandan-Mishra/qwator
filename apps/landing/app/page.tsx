"use client";

import React, { useEffect } from "react";

export default function Home() {

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8fafc",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Welcome to Qwator</h1>
      <div style={{ display: "flex", gap: 24 }}>
        <button
          style={{
            padding: "16px 32px",
            fontSize: 18,
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => (window.location.href = process.env.NEXT_PUBLIC_USER_URL || "http://localhost:4002")}
        >
          Continue as User
        </button>
        <button
          style={{
            padding: "16px 32px",
            fontSize: 18,
            borderRadius: 8,
            border: "none",
            background: "#10b981",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => (window.location.href = process.env.NEXT_PUBLIC_VOTER_URL || "http://localhost:4001")}
        >
          Continue as Voter
        </button>
      </div>
    </div>
  );
}
