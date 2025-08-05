"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/prisma";

export async function signOutAction() {
  await signOut();
}

export async function deleteAccountAction() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    throw new Error("Not authenticated");
  }

  try {
    // signout first, otherwise it errors.
    await signOut();

    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      // normal, ignore
      return;
    }
    console.error("Error deleting account:", error);
    throw new Error("Failed to delete account");
  }
}
