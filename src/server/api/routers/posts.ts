import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import type { Post } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per minute 
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,

  prefix: "@upstash/ratelimit",
});

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (await clerkClient.users.getUserList({
    userId: posts.map((post) => post.authorId),
    limit: 100,
  }
  )).map(filterUserForClient);



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
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPosts(posts);

  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPosts([post]))[0];
    }),


  getByUserId: publicProcedure.input(
    z.object({
      userId: z.string()
    }))
    .query(({ input, ctx }) => ctx.prisma.post.findMany({
      where: {
        authorId: input.userId,
      },
      orderBy: [{ createdAt: "desc" }],
    }).then(addUserDataToPosts),
    ),

  count: publicProcedure.input(
    z.object({
      userId: z.string()
    })).query(({ input, ctx }) => ctx.prisma.post.count({
      where: {
        authorId: input.userId,
      },
    })
  ),

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

  edit: privateProcedure.input(z.object({
    postId: z.string(),
    title: z.string().min(1).max(255),
    content: z.string().min(1).max(2500),
    tag: z.string().min(1).max(255),
  })).mutation(async ({ctx, input}) => {

    const editPost = await ctx.prisma.post.update({
      where: {
        id: input.postId,
      },
      data: {
        title : input.title,
        content : input.content,
        tag : input.tag,
      }
    })

    return editPost;

  }),

  


});
