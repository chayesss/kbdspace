import Head from "next/head";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { SideBar } from "~/components/sidebar";
import { MobileHeader } from "~/components/mobileheader";
import type { GetStaticProps, NextPage } from "next";
import PostView from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { IoIosArrowRoundBack } from "react-icons/io";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
import { useRouter } from "next/router"
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

import { LoadingSpinner } from "~/components/loading";
import { TfiCommentAlt } from "react-icons/tfi";
import CommentView from "~/components/commentview";
dayjs.extend(relativeTime);


const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });



export const getStaticProps: GetStaticProps = async (context) => {

  const ssg = generateSSGHelper();
  const id = context.params?.id;

  if (typeof id !== "string") {
    throw new Error("No id");
  }



  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  }
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}



const CommentDisplay: NextPage<{ id: string }> = ({ id }) => {

  const { data } = api.comments.getAll.useQuery({ postId: id });
  

  if (!data) return <LoadingSpinner />

  if (data.length === 0) return <div className="flex w-full justify-center pt-4 gap-4 ">
    <p className="text-slate-300">No comments yet</p>
  </div>

  return (
    <div className="flex flex-col gap-4 ">
      {data?.map((fullComment) => (
        <CommentView {...fullComment} key={fullComment.comment.id} isFullComment={true} />))}
    </div>
  )


}

const CreateComment: NextPage<{ id: string }> = ({ id }) => {

  const ctx = api.useContext();
  const { isSignedIn } = useUser();

  const { mutate } = api.comments.create.useMutation({
    onSuccess: () => {
      setContent("");
      setIsCommenting(false);

      void ctx.comments.getAll.invalidate({ postId: id });
    }
  });

  const commentCount = api.comments.countByPostId.useQuery({ postId: id });

  const [content, setContent] = useState("");

  const [count, setCount] = useState(content.replace(/(<([^>]+)>)/gi, "").length);

  const [isCommenting, setIsCommenting] = useState(false);


  return (
    <div className=" flex flex-col p-2 gap-4 w-full">

      <div className="flex flex-row items-center p-2">
        {!!isSignedIn ?
          <button className="w-[12rem] flex flex-row items-center text-lg gap-2" onClick={() => setIsCommenting(true)}>
            <TfiCommentAlt size={20} /><p>Leave a Comment</p>
          </button> :
          <button className="w-[16rem] text-slate-400 flex flex-row items-center text-lg cursor-not-allowed gap-2" disabled >
            <TfiCommentAlt size={20} /><p>Sign in to leave a comment</p>
          </button>
        }
        <div className="flex-grow"></div>
        <p className="text-lg font-thin">{commentCount.data || 0} comments</p>
      </div>

      {!!isCommenting &&
        <div className=" flex flex-col p-2 gap-4 w-full">


          <ReactQuill
            id="content"
            value={content}
            onChange={(e) => { setContent(e); setCount(e.replace(/(<([^>]+)>)/gi, "").length) }}
            className="h-[12rem] pb-8"
          />
          <div className="hidden sm:flex justify-end">
            {count > 10000 &&
              <p className="text-red-500">
                {count}/10000
              </p>}
            {count <= 10000 &&
              <p className="hidden sm:flex text-slate-300">
                {count}/10000
              </p>
            }

          </div>
          <div className="flex flex-row gap-4 justify-end">
            {(count > 0 && count < 10000) ?
              <button className="bg-sky-400 hover:bg-sky-600 duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded mt-8 sm:mt-1 mb-2" onClick={() => mutate({ content: content, postId: id })}>
                Comment
              </button> :
              <button className="bg-sky-800 duration-150 text-slate-400 cursor-not-allowed font-bold  py-2 px-4 border border-sky-700 rounded mt-8 sm:mt-1 mb-2" disabled >
                Comment
              </button>
            }
            <div>
              <button className="bg-slate-100 hover:bg-slate-300 duration-150 text-slate-900 font-bold py-2 px-4 border border-sky-700 rounded mt-8 sm:mt-1 mb-2" onClick={() => setIsCommenting(false)}>
                Cancel
              </button>
            </div>
          </div>

        </div>
      }


    </div>
  )
};


const PostPage: NextPage<{ id: string }> = ({ id }) => {

  const { data } = api.posts.getById.useQuery({ id });

  const router = useRouter();


  // return empty div if data not loaded
  if (!data) return <div>404</div>;



  return (
    <>
      <Head>
        <title>{`${data.post.title} - @${data.author.username || ""} / KBDSpace`}</title>
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
            <div className="flex flex-row gap-4 pb-6">
              <div className="mr-2 flex flex-row hover:underline items-center">
                <button className="w-[8rem] text-slate-100 flex flex-row items-center text-lg gap-2" onClick={() => router.back()}>
                  <IoIosArrowRoundBack size={24} /><p>Go back</p>
                </button>
              </div>
            </div>
            <div className="">
              <PostView {...data} isFullPost={true} />
            </div>
            <div className="flex flex-col">
              <div className="">
                <CreateComment id={id} />
              </div>
            </div>
            <div>
              <CommentDisplay id={id} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default PostPage;
