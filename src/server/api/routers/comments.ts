import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Comment } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,

  prefix: "@upstash/ratelimit",
});

const addUserDataToComments = async (comments: Comment[]) => {

  const users = (await clerkClient.users.getUserList({
    userId: comments.map((comment) => comment.authorId),
    limit: 100,
  }
  )).map(filterUserForClient);



  return comments.map((comment) => {
    {
      const author = users.find((user) => user.id === comment.authorId);

      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author not found"
        });
      }



      return {
        comment,
        author,
      };
    }
  });
};

export const commentsRouter = createTRPCRouter({

  getAll: publicProcedure.input(z.object({ postId: z.string(), })).query(async ({ ctx, input }) => {
    const comments = await ctx.prisma.comment.findMany({
      where: {postId: input.postId}, 
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToComments(comments);

  }),
  
  countByUserId: publicProcedure.input(
    z.object({
      userId: z.string()
    })).query(({ input, ctx }) => ctx.prisma.comment.count({
      where: {
        authorId: input.userId,
      },
    })
  ),

  countByPostId: publicProcedure.input(
    z.object({
      postId: z.string()
    })).query(({ input, ctx }) => ctx.prisma.comment.count({
      where: {
        postId: input.postId,
      },
    })
  ),

  getByUserId: publicProcedure.input(
    z.object({
      userId: z.string()
    }))
    .query(({ input, ctx }) => ctx.prisma.comment.findMany({
      where: {
        authorId: input.userId,
      },
      orderBy: [{ createdAt: "desc" }],
    }).then(addUserDataToComments),
    ),

    create: privateProcedure.input(z.object({
      postId: z.string(),
      content: z.string().min(1).max(15000),
    })).mutation(async ({ ctx, input }) => {
  
      const authorId = ctx.userId;
  
      const { success } = await ratelimit.limit(authorId);
  
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit."
        });
      }
  
      const comment = await ctx.prisma.comment.create({
        data: {
          authorId,
          postId: input.postId,
          content: input.content,
        },
      })
  
      return comment;
  
    }),

  delete: privateProcedure.input(z.object({
    commentId: z.string().min(1),
  })).mutation(async ({ ctx, input }) => {


    const deletePost = await ctx.prisma.comment.delete({
      where: {
        id: input.commentId,
      },
    });

    return deletePost;

  }),

  deleteByPostId: privateProcedure.input(z.object({
    postId: z.string().min(1),
  })).mutation(async ({ ctx, input }) => {


    const deletecomment = await ctx.prisma.comment.deleteMany({
      where: {
        postId: input.postId,
      },
    });

    return deletecomment;

  }),

  edit: privateProcedure.input(z.object({
    commentId: z.string(),
    content: z.string().min(1).max(15000),
  })).mutation(async ({ctx, input}) => {

    const editPost = await ctx.prisma.comment.update({
      where: {
        id: input.commentId,
      },
      data: {
        content : input.content,
      }
    })

    return editPost;

  }),

});