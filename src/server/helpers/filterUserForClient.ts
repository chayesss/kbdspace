import type { User } from "@clerk/nextjs/dist/types/server";
import Trpc from "~/pages/api/trpc/[trpc]";

export const filterUserForClient = (user: User) => {

  
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl
  };
};