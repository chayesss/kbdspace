import type { User } from "@clerk/nextjs/dist/types/server";

export const filterUserForClient = (user: User) => {

  return {
    id: user.id,
    fullname: `${user.firstName || ""} ${user.lastName || ""}`,
    username: user.username,
    profileImageUrl: user.profileImageUrl
  };
};