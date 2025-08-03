import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FeedClient } from "./feedClient";

export default async function Feed() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return <FeedClient session={session} />;
}
