import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

import { AnimatePresence, motion } from "framer-motion";

import Image from "next/image";
import toast from "react-hot-toast";
dayjs.extend(relativeTime);


const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });




type CommentWithUser = RouterOutputs["comments"]["getAll"][number];
const CommentView = (props: CommentWithUser & { isFullComment: boolean }) => {

  const { comment, author, isFullComment } = props;
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


  const postData = api.posts.getById.useQuery({ id: comment.postId });

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

          <div className="w-full gap-2 flex flex-col">
            <div className="flex flex-row gap-3 items-center flex-shrink-0">
              <Link href={`/@${author.username || ""}`}>
                <Image
                  src={author.profileImageUrl}
                  alt="pfp"
                  className="rounded-full w-12 h-12 min-w-[48px] flex-shrink-0"
                  width={48}
                  height={48}
                />
              </Link>
              <div className="flex flex-row flex-wrap items-center gap-2">
                <div className="flex flex-row gap-2">
                  <Link href={`/@${author.username || ""}`}><span className="font-semibold hover:underline">@{author.username}</span></Link>
                  <span> · </span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className="font-thin">{`  ${dayjs(comment.createdAt).fromNow()}`} </span>
                  {!isFullComment && <span > · </span>}
                </div>
                {!isFullComment &&
                  <div className="flex gap-2">
                    <span className="font-thin"> on <Link className="text-white font-semibold" href={`/post/${comment.postId || ""}`}>{postData.data?.post.title}</Link> by <Link className="text-white font-semibold" href={`/@${postData.data?.author.username || ""}`}>{`@${postData.data?.author.username || ""}`}</Link></span>
                  </div>
                }

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
                      <div className="mx-auto bg-black opacity-60 w-screen h-screen z-40 fixed inset-0 flex items-center" onClick={() => setToggleEdit(false)}></div>
                      <AnimatePresence>
                        <motion.div className="mx-auto bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl shadow-black rounded-b-lg h-[29.5rem] z-50 p-8 sm:w-3/4 lg:w-[44rem] fixed inset-0"
                          initial={{ y: '-100%' }}
                          animate={{ y: 0 }}
                          exit={{ y: '-100%' }}>

                          <div className="flex flex-row pb-4">

                            <h1 className="text-3xl font-bold">Edit Comment</h1>
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
                              {count > 10000 &&
                                <p className="text-red-500">
                                  {count}/10000
                                </p>}
                              {count <= 10000 &&
                                <p className="text-slate-300">
                                  {count}/10000
                                </p>
                              }

                            </div>
                            {(count > 0 && count < 10000) ?
                              <button className="bg-sky-400 hover:bg-sky-600 duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded mt-2 " onClick={() => { editPost({ commentId: comment.id, content: content, }); setToggleEdit(false); }}>
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
                      <div className="mx-auto bg-black opacity-60 w-screen h-screen z-40 fixed inset-0 flex items-center" onClick={() => setToggleDelete(false)}></div>
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

export default CommentView;