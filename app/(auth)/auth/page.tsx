"use client";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function AuthPage() {
  const [isSignUp, setiIsSignUp] = useState(true);
  const router = useRouter();
  const toggleForm = () => {
    setiIsSignUp(!isSignUp);
  };
  return <div>AuthPage</div>;
}
