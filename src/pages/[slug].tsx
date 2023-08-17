import Head from "next/head";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { SideBar } from "~/components/sidebar";
import { MobileHeader } from "~/components/mobileheader";
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { LoadingSpinner } from "~/components/loading";
import PostView from "~/components/postview";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/router";
import CommentView from "~/components/commentview";
import { useState } from "react";
dayjs.extend(relativeTime);



export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("No slug");
  }

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  }
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}

const ProfilePostFeed = (props: { userId: string }) => {

  const { data, isLoading } = api.posts.getByUserId.useQuery({ userId: props.userId });

  if (!data) return <LoadingSpinner />;

  if (isLoading) return <div className="flex justify-center text-lg font-medium pt-[10rem]">User has not posted.</div>;

  return (
    <div className="flex flex-col gap-4 mt-6">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} isFullPost={false} />))}
    </div>
  )

};

const ProfileCommentFeed = (props: { userId: string }) => {

  const { data } = api.comments.getByUserId.useQuery({ userId: props.userId });

  if (!data) return <LoadingSpinner />;

  if (data.length == 0) return <div className="flex justify-center text-lg font-medium pt-[10rem]">User has not commented.</div>;

  return (
    <div className="flex flex-col gap-4 mt-6">
      {data?.map((fullPost) => (
        <CommentView {...fullPost} key={fullPost.comment.id} isFullComment={false}  />))}
    </div> 
  ) 

};


const ProfilePage: NextPage<{ username: string }> = ({username}) => {

  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  const postCount = api.posts.count.useQuery( {userId: data?.id || " "});
  const commentCount = api.comments.countByUserId.useQuery({ userId: data?.id || " " });

  api.posts.getByUserId.useQuery({ userId: data?.id || " " });

  const router = useRouter();

  const [isPosts, setIsPosts] = useState(true);

  // return empty div if data not loaded
  if (!data) return <>
  <Head>
    <title>{`404: Page not found / KBDSpace`}</title>
  </Head>
  <div className="flex justify-center text-lg font-thin items-center h-screen">404: page not found.</div>
  </>;



  return (
    <>
      <Head>
        <title>{`@${data.username || ""} / KBDSpace`}</title>
        <meta name="description" content="Generated by create-t3-app" />
      </Head>


      <main>
        <div>
          <MobileHeader />
        </div>
        <div className="flex flex-col sm:flex-row justify-center h-full gap-4 m-4 pt-16 lg:pt-0">
          <div className="hidden lg:block flex-shrink-0 w-[22rem] mr-4 h-screen overflow-y-auto">
            <SideBar />
          </div>
          <div className="w-full max-w-6xl ">
            <div >
              <div className="mr-2 flex flex-row items-center pb-6">
                <button className="w-[8rem] text-slate-100 flex flex-row items-center text-lg gap-2" onClick={() => router.back()}>
                  <IoIosArrowRoundBack size={24} /><p>Go back</p>
                </button>
              </div>
              <div className="flex flex-row gap-4 pb-4 ">
                <Image
                  src={data.profileImageUrl}
                  alt="pfp"
                  className="rounded-full w-16 h-16"
                  width={128}
                  height={128}
                />
                <div>
                  <div>
                    <h1 className="text-2xl text-white tracking-widest font-bold">{data.fullname}</h1>
                  </div>
                  <div className="flex flex-row gap-2 flex-wrap items-center">
                    <h1 className="text-lg text-slate-300 tracking-wider font-thin">{`@${data.username || ""}`}</h1>
                    <span className="text-slate-300"> · </span>
                    <h1 className="text-lg text-slate-300 tracking-wider font-thin">{`${postCount.data || 0} posts`}</h1>
                    <span className="text-slate-300"> · </span>
                    <h1 className="text-lg text-slate-300 tracking-wider font-thin">{`${commentCount.data || 0} comments`}</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row">

              {!!isPosts ?
                <button className="w-full">
                  <div className="border-b w-full flex justify-center">
                    <h1 className="text-xl text-white tracking-wide font-base">Posts</h1>
                  </div>
                </button> :
                <button className="w-full"  onClick={() => setIsPosts(true)}>
                  <div className="border-b border-slate-700 w-full flex justify-center">
                    <h1 className="text-xl text-slate-300 tracking-wide font-thin">Posts</h1>
                  </div>
                </button>
              }
              
              {!isPosts ? 
              <button className="w-full" >
                <div className="border-b w-full flex justify-center">
                  <h1 className="text-xl text-white tracking-wide font-base">Comments</h1>
                </div>
              </button> : 
              <button className="w-full" onClick={() => setIsPosts(false)} >
                <div className="border-b border-slate-700 w-full flex justify-center">
                  <h1 className="text-xl text-slate-300 tracking-wide font-thin">Comments</h1>
                </div>
              </button>}
              

            </div>
            <div>
              {!!isPosts ?
              <ProfilePostFeed userId={data.id} /> :
              <ProfileCommentFeed userId={data.id} />
              }    
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ProfilePage;
