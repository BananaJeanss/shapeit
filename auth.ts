import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  callbacks: {
    async session({ session, user }) {
      // check if user exists and doesn't have githubUsername set
      if (session.user?.email && user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { githubUsername: true },
        });

        if (dbUser && !dbUser.githubUsername) {
          // try to get github username from account
          const account = await prisma.account.findFirst({
            where: {
              userId: user.id,
              provider: "github",
            },
            select: { providerAccountId: true },
          });

          if (account) {
            // fetch GitHub profile to get username
            try {
              const response = await fetch(
                `https://api.github.com/user/${account.providerAccountId}`,
                {
                  headers: { "User-Agent": "Shapeit-App" },
                }
              );

              if (response.ok) {
                const githubProfile = await response.json();
                await prisma.user.update({
                  where: { email: session.user.email },
                  data: { githubUsername: githubProfile.login },
                });

                session.user.githubUsername = githubProfile.login;
              }
            } catch (error) {
              console.error("Error fetching GitHub username:", error);
            }
          }
        } else if (dbUser?.githubUsername) {
          session.user.githubUsername = dbUser.githubUsername;
        }
      }

      return session;
    },
  },
});
