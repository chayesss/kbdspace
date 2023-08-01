import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 3 requests per minute 
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,

  prefix: "@upstash/ratelimit",
});

const filterUserForClient = (user: User) => {
  if (!user.username) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Username not found"
    });
  }
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{createdAt: "desc"}],
    });

    const userList = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    });

    const users = userList.map(filterUserForClient);


    return posts.map((post) => {
      {
        const author = users.find((user) => user.id === post.authorId);

        if (!author) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author not found"
          });
        }



        return {
          post,
          author,
        };
      }
    });

  }),

  create: privateProcedure.input(
    z.object({
      title: z.string().min(1).max(255),
      content: z.string().min(1).max(2500),
      tag: z.string().min(1).max(255),
  }))
  .mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;

    const { success } = await ratelimit.limit(authorId);

    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "You have exceeded the rate limit."
      });
    }

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        title: input.title,
        content: input.content,
        tag: input.tag,
      },
    });

    return post;
  }),

  delete: privateProcedure.input(z.object({ 
    postId: z.string().min(1),
  })).mutation(async ({ ctx, input }) => {
    
    const deletePost = await ctx.prisma.post.delete({
      where: {
        id: input.postId,
      },
    });

    return deletePost;
    
  }),

  
});
