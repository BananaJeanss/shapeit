"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import type { ShapeType } from "@prisma/client";
import { put, head } from "@vercel/blob";
import crypto from "crypto";

export async function createPost(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const content = formData.get("content") as string;
  const imageFiles = formData.getAll("images") as File[];

  // check if text/at least 1 image is provided
  if (!content?.trim()) {
    if (imageFiles.length === 0) {
      throw new Error("Post content or images are required");
    }
  }

  // check if exceeds 365 char limit
  if (content.length > 365) {
    throw new Error("Post content exceeds 365 character limit");
  }

  // allow max 4 images
  if (imageFiles.length > 4) {
    throw new Error("You can only upload up to 4 images");
  }

  try {
    // upload images to Vercel Blob and get URLs
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (file.size > 0) {
        // read file as ArrayBuffer and set filename to hash to prevent duplicates
        const arrayBuffer = await file.arrayBuffer();
        const hash = crypto
          .createHash("sha256")
          .update(Buffer.from(arrayBuffer))
          .digest("hex");
        const ext = file.name.split(".").pop();
        const fileName = `${hash}${ext ? "." + ext : ""}`;

        // check if file already exists
        let blob;
        try {
          const existingBlob = await head(fileName).catch(() => null);

          if (existingBlob) {
            // file exists, use existing blob
            blob = existingBlob;
          } else {
            // file does not exist, upload it
            blob = await put(fileName, file, {
              access: "public",
              addRandomSuffix: false,
            });
          }
        } catch (err) {
          // on error, upload the file anyways
          console.error("Error checking file existence:", err);
          blob = await put(fileName, file, {
            access: "public",
            addRandomSuffix: false,
          });
        }

        imageUrls.push(blob.url);
      }
    }

    await prisma.post.create({
      data: {
        content: content.trim(),
        images: imageUrls,
        author: {
          connect: {
            email: session.user.email,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

export async function toggleReaction(postId: string, shape: ShapeType) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // check if user already has a reaction on this post
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.shape === shape) {
        // remove reaction if clicking the same shape
        await prisma.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
      } else {
        // update reaction to new shape
        await prisma.reaction.update({
          where: {
            id: existingReaction.id,
          },
          data: {
            shape: shape,
          },
        });
      }
    } else {
      // create new reaction
      await prisma.reaction.create({
        data: {
          shape: shape,
          userId: user.id,
          postId: postId,
        },
      });
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    throw new Error("Failed to toggle reaction");
  }
}

export async function getPostsWithReactionCounts(
  userId?: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  try {
    // get posts with basic info
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      include: {
        author: {
          select: {
            name: true,
            image: true,
            githubUsername: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // get reaction counts efficiently using aggregation
    const postIds = posts.map((post) => post.id);

    // get shape counts for all posts
    const reactionCounts = await prisma.reaction.groupBy({
      by: ["postId", "shape"],
      where: {
        postId: {
          in: postIds,
        },
      },
      _count: {
        id: true,
      },
    });

    const userReactions = userId
      ? await prisma.reaction.findMany({
          where: {
            userId,
            postId: {
              in: postIds,
            },
          },
          select: {
            postId: true,
            shape: true,
          },
        })
      : [];

    const reactionCountMap = new Map<string, Record<ShapeType, number>>();
    postIds.forEach((postId) => {
      reactionCountMap.set(postId, {
        TRIANGLE: 0,
        CIRCLE: 0,
        SQUARE: 0,
        DIAMOND: 0,
        HEXAGON: 0,
      });
    });

    reactionCounts.forEach(({ postId, shape, _count }) => {
      const counts = reactionCountMap.get(postId);
      if (counts) {
        counts[shape] = _count.id;
      }
    });

    // user reaction map
    const userReactionMap = new Map<string, ShapeType>();
    userReactions.forEach(({ postId, shape }) => {
      userReactionMap.set(postId, shape);
    });

    return posts.map((post) => {
      const shapeCounts = reactionCountMap.get(post.id) || {
        TRIANGLE: 0,
        CIRCLE: 0,
        SQUARE: 0,
        DIAMOND: 0,
        HEXAGON: 0,
      };

      return {
        ...post,
        shapeCounts: {
          triangle: shapeCounts.TRIANGLE,
          circle: shapeCounts.CIRCLE,
          square: shapeCounts.SQUARE,
          diamond: shapeCounts.DIAMOND,
          hexagon: shapeCounts.HEXAGON,
        },
        userReaction: userReactionMap.get(post.id) || null,
      };
    });
  } catch (error) {
    console.error("Error fetching posts with reaction counts:", error);
    return [];
  }
}

export async function getPostsWithReactionCountsByUsername(
  username: string,
  currentUserId?: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  try {
    // get user by username
    const user = await prisma.user.findFirst({
      where: { githubUsername: username },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    // get posts only by this user with basic info
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      where: {
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            githubUsername: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // get reaction counts efficiently using aggregation
    const postIds = posts.map((post) => post.id);

    if (postIds.length === 0) {
      return [];
    }

    // get shape counts for all posts
    const reactionCounts = await prisma.reaction.groupBy({
      by: ["postId", "shape"],
      where: {
        postId: {
          in: postIds,
        },
      },
      _count: {
        id: true,
      },
    });

    const userReactions = currentUserId
      ? await prisma.reaction.findMany({
          where: {
            userId: currentUserId,
            postId: {
              in: postIds,
            },
          },
          select: {
            postId: true,
            shape: true,
          },
        })
      : [];

    const reactionCountMap = new Map<string, Record<ShapeType, number>>();
    postIds.forEach((postId) => {
      reactionCountMap.set(postId, {
        TRIANGLE: 0,
        CIRCLE: 0,
        SQUARE: 0,
        DIAMOND: 0,
        HEXAGON: 0,
      });
    });

    reactionCounts.forEach(({ postId, shape, _count }) => {
      const counts = reactionCountMap.get(postId);
      if (counts) {
        counts[shape] = _count.id;
      }
    });

    // user reaction map (what the current viewing user has reacted to)
    const userReactionMap = new Map<string, ShapeType>();
    userReactions.forEach(({ postId, shape }) => {
      userReactionMap.set(postId, shape);
    });

    return posts.map((post) => {
      const shapeCounts = reactionCountMap.get(post.id) || {
        TRIANGLE: 0,
        CIRCLE: 0,
        SQUARE: 0,
        DIAMOND: 0,
        HEXAGON: 0,
      };

      return {
        ...post,
        shapeCounts: {
          triangle: shapeCounts.TRIANGLE,
          circle: shapeCounts.CIRCLE,
          square: shapeCounts.SQUARE,
          diamond: shapeCounts.DIAMOND,
          hexagon: shapeCounts.HEXAGON,
        },
        userReaction: userReactionMap.get(post.id) || null,
      };
    });
  } catch (error) {
    console.error("Error fetching posts by username:", error);
    return [];
  }
}

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  try {
    // check if the user is the author of the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || user.id !== post.authorId) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }

    // delete the post, reactions deleted via cascade
    await prisma.post.delete({
      where: { id: postId },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export async function reportPost(postId: string, reason: string) {
  // todo, this has no actual functionality rn
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  console.log(
    `Post ${postId} reported by ${session.user.email} for: ${reason}`
  );
}

export async function getTotalPostCount(): Promise<number> {
  try {
    return await prisma.post.count();
  } catch (error) {
    console.error("Error fetching total post count:", error);
    return 0;
  }
}

export async function getUserByGithubUsername(githubUsername: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { githubUsername },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        githubUsername: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by GitHub username:", error);
    throw error;
  }
}

export async function getUserGithubData(name: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${name}`, {
      headers: {
        "User-Agent": "Shapeot-App",
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      name: data.name || name,
      bio: data.bio || "",
      avatarUrl: data.avatar_url || "",
      htmlUrl: data.html_url || "",
    };
  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    return null;
  }
}
