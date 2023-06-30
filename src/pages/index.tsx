import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { type RouterOutputs, api } from "~/utils/api";
import { dark } from "@clerk/themes";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime);

// const NewPostButton = () => () => {
//   const { user } = useUser();

//   if (!user) return null;

//   return <div>
//     <img src={user.profileImageUrl} alt='pfp' />
//   </div>

// }

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="p-8 border-b flex flex-row gap-4">
      <div>
        <img src={author.profileImageUrl} alt="pfp" className="rounded-full w-12 h-12" />
      </div>
      <div>
        <div className="text-xl font-semibold">
          <span>{post.title}</span>
        </div>
        <div className="flex flex-row gap-1">
          <span className="font-semibold">@{author.username}</span>
          <span className="font-thin">{` - ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
      </div>
    </div>
  )

}

export default function Home() {

  const user = useUser()

  const { data, isLoading } = api.posts.getAll.useQuery();


  // TODO: REPLACE WITH LOADING COMPONENT
  if (isLoading) return (<div>Loading...</div>);

  if (!data) return (<div>Something went wrong...</div>);

  return (
    <>
      <Head>
        <title>kbdspace</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className="flex justify-center h-screen">
        <div className="w-full md: max-w-5xl border-x">
          <div className="flex flex-row border-b p-4">
            <div className="w-full align-middle">
              <h1 className="text-2xl font-bold tracking-widest">kbdspace</h1>
            </div>
            <div className="flex w-full justify-end">
              {!user.isSignedIn && <SignInButton />}
              {!!user.isSignedIn && <UserButton
                appearance={{
                  baseTheme: dark,
                  elements: {
                    // TODO: CHANGE SIZE OF AVATAR
                  }
                }}
                userProfileMode="navigation"
                userProfileUrl={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/profile`
                    : undefined
                }
              />}
            </div>
          </div>
          <div className="flex flex-col">
            {data?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />)) ?? <div>Loading...</div>}
          </div>
        </div>
      </main>
    </>
  );
}
