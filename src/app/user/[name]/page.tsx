import { LeftBar } from "@/src/components/leftBar";
import { RightBar } from "@/src/components/rightBar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Github } from "lucide-react";
import { ProfileClient } from "./profileClient";
import { Providers } from "@/src/components/providers";
import { prisma } from "@/prisma";
import {
  getUserByGithubUsername,
  getUserGithubData,
  getPostsWithReactionCountsByUsername,
} from "@/src/actions/posts";
import { notFound } from "next/navigation";

export default async function Profile({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  const userName = (await params).name;

  // check if user actually exists
  const user = await getUserByGithubUsername(userName);
  if (!user) {
    notFound();
  }

  const userGithubData = user.githubUsername
    ? await getUserGithubData(user.githubUsername)
    : null;

  // get current user ID for reaction checking
  const currentUser = session.user.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
      })
    : null;

  // get initial posts by this user
  const initialPosts = await getPostsWithReactionCountsByUsername(
    userName,
    currentUser?.id,
    1,
    20
  );

  return (
    <div className="flex flex-row w-screen h-screen overflow-hidden">
      <div className="w-1/3 flex-shrink-0">
        <LeftBar />
      </div>
      <div className="flex flex-col border-r border-gray-300 w-1/3 flex-shrink-0 h-full">
        <h2 className="text-4xl font-semibold mx-8 my-4">
          @{user.githubUsername || userName}&apos;s Profile
        </h2>
        <hr className="w-[90%] mx-auto mb-4" />
        <div className="flex px-8 mb-2">
          <div className="flex w-3/4 flex-col items-start justify-center gap-2">
            <h3 className="text-2xl font-semibold">
              @{user.githubUsername || userName}
            </h3>
            <p>{userGithubData?.bio || "No bio available"}</p>
            {user.githubUsername && (
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row gap-2 items-center justify-center mt-2 px-4 py-2 border border-white text-white rounded-full hover:bg-blue-900 cursor-pointer transition-colors"
              >
                <Github className="w-5 h-5" />
                Github Profile
              </a>
            )}
          </div>
          <div className="flex w-1/4 flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <Image
                src={user.image || ""}
                alt="Profile Picture"
                className="w-32 h-32 rounded-full"
                width={128}
                height={128}
              />
            </div>
          </div>
        </div>
        <hr className="w-[90%] mx-auto my-4" />
        <div className="flex-1 overflow-y-auto">
          <Providers session={session}>
            <ProfileClient
              username={userName}
              currentUserId={currentUser?.id}
              initialPosts={initialPosts}
            />
          </Providers>
        </div>
      </div>
      <div className="w-1/3 flex-shrink-0">
        <RightBar
          session={{
            user: {
              name: session.user?.name ?? undefined,
              image: session.user?.image ?? undefined,
              githubUsername: session.user?.githubUsername ?? undefined,
            },
          }}
        />
      </div>
    </div>
  );
}
