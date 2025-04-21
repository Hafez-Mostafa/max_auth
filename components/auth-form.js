"use client";
import Link from "next/link";

import { auth } from "../actions/auth-actions"; // Ensure this is the correct path to your action
import { useActionState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }) {
  // This is the action state hook that will manage the form state
  // It will handle the form submission and manage the loading state
  const [formState, formAction] = useActionState(auth.bind(null,mode), {});
  // This is the action function that will be called when the form is submitted
  const router = useRouter();
  // This effect will run when the formState changes
  useEffect(() => {
    if (formState?.redirectTo) {
      router.push(formState.redirectTo);
    }
  }, [formState, router]);
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <Image
          src="/images/auth-icon.jpg"
          width={100}
          height={100}
          alt="A lock icon"
        />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {/* This is the action function that will be called when the form is submitted */}
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
        <button type="submit">
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </p>
      <p>
        {mode === "login" && (<Link href="/?mode=signup"> Create Account.</Link>)}

        {mode === "signup" && (
          <Link href="/?mode=login">Login with existing account.</Link>
        )}
      </p>
    </form>
  );
}
