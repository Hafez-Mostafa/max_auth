"use server";

import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
// import { redirect } from "next/navigation";

import { createAuthSession, destroySession } from "@/lib/authentication"; // Ensure this is the correct path to your auth module
import { redirect } from "next/navigation";

export async function signUpUser(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate inputs
  const errors = {};

  if (!email.includes("@")) {
    errors.email = "Email is invalid";
  }

  if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    // Hash password and create user
    const hashedPassword = hashUserPassword(password);
    const userId = await createUser(email, hashedPassword);

    await createAuthSession(userId); // Ensure lucia is defined and imported
    console.log("Session created for user:", userId);
    // Redirect after successful signup
    //  redirect("/training");
  } catch (error) {
    console.error("Signup error:", error);
    // if (error.message.includes("UNIQUE constraint failed: users.email")) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      // Assuming this is the error code for unique constraint violation
      // Handle duplicate email error
      console.error("Email already registered:", email);

      return { errors: { email: "This email is already registered" } };
    }

    return {
      errors: {
        general: "An error occurred during signup. Please try again.",
        error,
      },
    };
  }
  // At the end of signUpUser
  return { redirectTo: "/training" };
}

// This function handles the login process
export async function loginUser(prevState,formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate inputs
  const errors = {};

  if (!email.includes("@")) {
    errors.email = "Email is invalid";
  }

  if (password.trim().length === 0) {
    errors.password = "Password cannot be empty";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    // Authenticate user
    const user = await getUserByEmail(email); // Ensure this function is defined in your auth module

    if (!user) {
      return {
        errors: {
          email: "Could not authenticate user, please check your credentials",
        },
      };
    }
    // Verify password
    const verfiyedPassword = await verifyPassword(user.password, password); // Ensure this function is defined and works correctly
    if (!verfiyedPassword) {
      return {
        errors: {
          password:
            "Could not authenticate user, please check your credentials",
        },
      };
    }

    await createAuthSession(user.id); // Ensure this function is defined and works correctly
    console.log("Session created for user:", user.id);

    // Redirect after successful login
    return { redirectTo: "/training" };
  } catch (error) {
    console.error("Login error:", error);
    return {
      errors: {
        general: "An error occurred during login. Please try again.",
      },
    };
  }
}

export async function auth(mode,prevState, formData) {
  if (mode === "signup") {
    return await signUpUser(prevState, formData);
  } else if (mode === "login") {
    return await loginUser(prevState,formData);
  } else {
    throw new Error("Invalid mode. Mode must be either 'signup' or 'login'.");
  }
}


export async function logoutUser() {
  
  await destroySession(); // Ensure lucia is defined and imported
  redirect("/"); // Redirect to the auth page after logout

}