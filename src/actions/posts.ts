"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
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

  if (!content?.trim()) {
    throw new Error("Post content is required");
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

    revalidatePath("/feed");
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

    revalidatePath("/feed");
  } catch (error) {
    console.error("Error toggling reaction:", error);
    throw new Error("Failed to toggle reaction");
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostsWithReactionCounts(userId?: string) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    type Reaction = {
      id: string;
      shape: ShapeType;
      userId: string;
      postId: string;
      user: {
        id: string;
      };
    };

    type PostWithReactions = (typeof posts)[number] & {
      reactions: Reaction[];
    };

    return posts.map((post: PostWithReactions) => {
      const userReaction = userId
        ? post.reactions.find((r) => r.userId === userId)?.shape || null
        : null;

      return {
        ...post,
        shapeCounts: {
          triangle: post.reactions.filter((r) => r.shape === "TRIANGLE").length,
          circle: post.reactions.filter((r) => r.shape === "CIRCLE").length,
          square: post.reactions.filter((r) => r.shape === "SQUARE").length,
          diamond: post.reactions.filter((r) => r.shape === "DIAMOND").length,
          hexagon: post.reactions.filter((r) => r.shape === "HEXAGON").length,
        },
        userReaction,
      };
    });
  } catch (error) {
    console.error("Error fetching posts with reaction counts:", error);
    return [];
  }
}
