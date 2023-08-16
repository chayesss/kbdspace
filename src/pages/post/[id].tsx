import Head from "next/head";
import { type RouterOutputs, api } from "~/utils/api";
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
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

import { AnimatePresence, motion } from "framer-motion";

import Image from "next/image";
import { LoadingSpinner } from "~/components/loading";
import { TfiCommentAlt } from "react-icons/tfi";
import { BsCartX } from "react-icons/bs";
import toast from "react-hot-toast";
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

type CommentWithUser = RouterOutputs["comments"]["getAll"][number];
const CommentView = (props: CommentWithUser) => {

  const { comment, author } = props;
  const { user } = useUser();

  const [isExpanded, setIsExpanded] = useState(true);
  const [toggleDelete, setToggleDelete] = useState(false);
  const [toggleEdit, setToggleEdit] = useState(false);

  const ctx = api.useContext();
  
  const { mutate: deleteComment } = api.comments.delete.useMutation({
    onSuccess: () => {
      void ctx.comments.getAll.invalidate({ postId: comment.postId });
      toast.success("Post deleted");
  },
  onError: () => {
      toast.error("Error deleting post");
  }
  });

  
  const [content, setContent] = useState(comment.content);

  const [count, setCount] = useState(comment.content.replace(/(<([^>]+)>)/gi, "").length);

  const { mutate: editPost } = api.comments.edit.useMutation({
    onSuccess: () => {
      void ctx.comments.getAll.invalidate({ postId: comment.postId });
      toast.success("Post edited");
    },
    onError: () => {
      toast.error("Error editing post");
    }
  });

  return (
    <motion.div key={comment.id} className="overflow-hidden p-8 bg-gradient-to-t from-gray-950 to-gray-900 border border-slate-800 shadow shadow-black rounded-lg flex flex-col gap-2"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: .5, ease: "easeInOut", staggerChildren: 0.5, delayChildren: 0.5 }}
    >


        <div className="flex flex-row gap-4">
          {!isExpanded ?
            <div className="flex flex-row gap-2">
              <div className="flex flex-row gap-2">
                <Link href={`/@${author.username || ""}`}><span className="font-semibold hover:underline">@{author.username}</span></Link>
                <span> · </span>
              </div>
              <div className="flex flex-row gap-2">
                <span className="font-thin">{`  ${dayjs(comment.createdAt).fromNow()}`} </span>
              </div>
            </div> : 

            <div className="w-full">
              <div className="flex flex-row gap-3 items-start sm:items-center  flex-shrink-0">
                <Link href={`/@${author.username || ""}`}>
                  <Image
                    src={author.profileImageUrl}
                    alt="pfp"
                    className="rounded-full w-12 h-12"
                    width={48}
                    height={48}
                  />
                </Link>
                <div className="flex flex-row gap-2">
                  <div className="flex flex-row gap-2">
                    <Link href={`/@${author.username || ""}`}><span className="font-semibold hover:underline">@{author.username}</span></Link>
                    <span> · </span>
                  </div>
                  <div className="flex flex-row gap-2">
                    <span className="font-thin">{`  ${dayjs(comment.createdAt).fromNow()}`} </span>
                  </div>
                </div>
              </div>
              <div className="post">
                <span dangerouslySetInnerHTML={{ __html: comment.content }}></span>
              </div>
              <hr className=" border-slate-600 mt-1" />
              <div className="flex flex-row gap-2 items-center text-slate-300">
                {!!user && user.id == author.id &&
                  <div>
                    <button onClick={() => setToggleEdit(true)}>
                      <p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">edit</p>
                    </button>
                    {!!toggleEdit &&
                            <div>
                                <div className="mx-auto bg-black opacity-60 w-screen h-screen z-40 fixed inset-0 flex items-center"></div>
                                <AnimatePresence>
                                    <motion.div className="mx-auto bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl shadow-black rounded-b-lg h-[29.5rem] z-50 p-8 sm:w-3/4 lg:w-[44rem] fixed inset-0"
                                        initial={{ y: '-100%' }}
                                        animate={{ y: 0 }}
                                        exit={{ y: '-100%' }}>

                                        <div className="flex flex-row pb-4">

                                            <h1 className="text-3xl font-bold">Edit Post</h1>
                                            <div className="flex-grow"></div>

                                        </div>
                                        <div className=" flex flex-col gap-4 w-full">
                                            <ReactQuill
                                                id="content"
                                                value={content}
                                                onChange={(e) => { setContent(e); setCount(e.replace(/(<([^>]+)>)/gi, "").length) }}
                                                className="h-[12rem] pb-8"
                                            />
                                            <div className="hidden sm:flex justify-end">
                                                {count > 2000 &&
                                                    <p className="text-red-500">
                                                        {count}/2000
                                                    </p>}
                                                {count <= 2000 &&
                                                    <p className="text-slate-300">
                                                        {count}/2000
                                                    </p>
                                                }

                                            </div>
                                            {(count > 0 && count < 2000)  ?
                                                <button className="bg-sky-400 hover:bg-sky-600 duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded mt-2 " onClick={() => { editPost({ commentId: comment.id,  content: content, }); setToggleEdit(false); }}>
                                                    Edit Post
                                                </button> :
                                                <button className="bg-sky-800 duration-150 text-slate-400 cursor-not-allowed font-bold py-2 px-4 border border-sky-700 rounded mt-2 " disabled >
                                                    Edit Post
                                                </button>
                                            }
                                            <button className="bg-slate-50 hover:bg-slate-200  duration-150 text-slate-900 font-bold py-2 px-4 border border-sky-700 rounded " onClick={() => setToggleEdit(false)} >
                                                Cancel
                                            </button>

                                        </div>

                                    </motion.div>
                                </AnimatePresence>
                                <div>

                                </div>
                            </div>}
                  </div>}
                {!!user && user.id == author.id &&
                  <div className="gap-2 flex">
                    <span> · </span>
                    <button onClick={() => setToggleDelete(true)} >
                      <p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">delete</p>
                    </button>
                  {!!toggleDelete &&
                    <div>
                      <div className="mx-auto bg-black opacity-60 w-screen h-screen z-40 fixed inset-0 flex items-center"></div>
                      <AnimatePresence>
                        <motion.div className="mx-auto bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl shadow-black rounded-b-lg h-[10rem] z-50 p-8 sm:w-3/4 lg:w-[44rem] fixed inset-0"
                          initial={{ y: '-100%' }}
                          animate={{ y: 0 }}
                          exit={{ y: '-100%' }}>

                          <div className="flex flex-col">
                            <div className="flex flex-col">
                              <p className="text-xl font-semibold">Are you sure you want to delete this comment?</p>
                              <p className="font-thin">This process cannot be undone.</p>
                            </div>
                            <div className="flex-grow"></div>
                            <div className="flex flex-row justify-end">
                              <button className="bg-red-700 hover:bg-red-800 duration-150  text-slate-50 font-bold py-2 px-4 border border-slate-700 rounded mr-4 ml-4 mt-2 mb-2" onClick={() => { deleteComment({ commentId: comment.id }); setToggleDelete(false); }}>
                                Delete
                              </button>
                              <button className="bg-slate-50 hover:bg-slate-200 duration-150 text-slate-900 font-bold py-2 px-4 border border-slate-700 rounded mr-4 ml-4 mt-2 mb-2" onClick={() => setToggleDelete(false)}>
                                Cancel
                              </button>
                            </div>

                          </div>

                        </motion.div>
                      </AnimatePresence>
                      <div>

                      </div>
                    </div>}

                </div>}
              </div>
            </div>
          }

        </div>

    </motion.div>
  )
}

const CommentDisplay: NextPage<{ id: string }> = ({ id }) => {

  const { data } = api.comments.getAll.useQuery({ postId: id });

  if (!data) return <LoadingSpinner />

  return (
    <div className="flex flex-col gap-4 ">
      {data?.map((fullComment) => (
        <CommentView {...fullComment} key={fullComment.comment.id}  />))}
    </div>
  )


}

const CreateComment: NextPage<{ id: string }> = ({ id }) => {

  const ctx = api.useContext();

  const { mutate } = api.comments.create.useMutation({
    onSuccess: () => {
      setContent("");
      setIsCommenting(false);

      void ctx.comments.getAll.invalidate({ postId: id });
    }
  });

  const [content, setContent] = useState("");

  const [count, setCount] = useState(content.replace(/(<([^>]+)>)/gi, "").length);

  const [isCommenting, setIsCommenting] = useState(false);

  const variants = {
    closed: {
      height: 0,
    },
    open: {
      height: 'auto',
    },
  };

  return (
    <div className=" flex flex-col p-2 gap-4 w-full">

      <div className="p-2">
        <button className="w-[12rem] flex flex-row items-center text-lg gap-2" onClick={() => setIsCommenting(true)}>
          <TfiCommentAlt size={20} /><p>Leave a Comment</p>
        </button>
      </div>

      {!!isCommenting &&
        <motion.div className=" flex flex-col p-2 gap-4 w-full"
        key="createComment"
        initial="closed"
        animate="open"
        exit="closed"
        variants={variants}
        >


          <ReactQuill
            id="content"
            value={content}
            onChange={(e) => { setContent(e); setCount(e.replace(/(<([^>]+)>)/gi, "").length) }}
            className="h-[12rem] pb-8"
          />
          <div className="hidden sm:flex justify-end">
            {count > 2000 &&
              <p className="text-red-500">
                {count}/2000
              </p>}
            {count <= 2000 &&
              <p className="hidden sm:flex text-slate-300">
                {count}/2000
              </p>
            }

          </div>
          <div className="flex flex-row gap-4 justify-end">
            {(count > 0 && count < 2000) ?
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

        </motion.div>
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
        <link rel="icon" href="/favicon.ico" />
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
              <div className="w-full sm:w-3/4">
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
