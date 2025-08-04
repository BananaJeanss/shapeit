import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FeedClient } from "./feedClient";
import { getPostsWithReactionCounts } from "@/src/actions/posts";
import { prisma } from "@/prisma";
import { Providers } from "@/src/components/providers";

export default async function Feed() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  // get current user ID for reaction checking
  const currentUser = session.user.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
      })
    : null;

  // get posts with reaction counts and user's reactions
  const postsWithUserReactions = await getPostsWithReactionCounts(
    currentUser?.id
  );

  return (
    <Providers session={session}>
      <FeedClient
        session={session}
        initialPosts={postsWithUserReactions}
        currentUserId={currentUser?.id}
      />
    </Providers>
  );
}
