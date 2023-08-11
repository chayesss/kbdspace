import { useUser } from "@clerk/nextjs";
import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { AnimatePresence,  motion } from "framer-motion";
import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import toast from "react-hot-toast";
import Link from "next/link";
dayjs.extend(relativeTime);




type PostWithUser = RouterOutputs["posts"]["getAll"][number];
//creates individual post view
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const { user } = useUser();

  const [toggleDelete, setToggleDelete] = useState(false);

  const ctx = api.useContext();

  const { mutate } = api.posts.delete.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
    },
    onError: () => {
      toast.error("Error deleting post");
    }
  });



  return (
    <motion.div key={post.id} className="p-8 bg-gradient-to-t from-gray-950 to-gray-900 border border-slate-800 shadow shadow-black rounded-lg flex flex-col gap-2"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: .5, ease: "easeInOut", staggerChildren: 0.5, delayChildren: 0.5 }}
    >

      <div className="flex flex-row gap-3 items-start sm:items-center  flex-shrink-0">
        <Image
          src={author.profileImageUrl}
          alt="pfp"
          className="rounded-full w-12 h-12"
          width={48}
          height={48}
        />
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2">
            <div className="flex flex-row gap-2">
              <Link href={`/@${author.username || ""}`}><span className="font-semibold">@{author.username}</span></Link>
              <span> · </span>
            </div>
            <div className="flex flex-row gap-2">
              <span className="font-thin">{`  ${dayjs(post.createdAt).fromNow()}`}</span>
              <span className="hidden sm:flex"> · </span>
            </div>
            <span className="hidden items-center sm:flex">
              {post.tag == "News" && <div className="p-1 pt-0 pb-0 mt-0 mb-0 rounded  text-green-500"><p>News</p></div>}
              {post.tag == "Miscellaneous" && <div className="p-0.5 pt-0 pb-0 rounded  text-pink-500">Miscellaneous</div>}
              {post.tag == "Discussion" && <div className="p-0.5 pt-0 pb-0 rounded text-blue-500">Discussion</div>}
              {post.tag == "Question" && <div className="p-0.5 pt-0 pb-0 rounded  text-purple-600">Question</div>}
              {post.tag == "Announcement" && <div className="p-0.5 pt-0 pb-0 rounded  text-red-600">Announcement</div>}
              {post.tag == "Feedback" && <div className="p-0.5 pt-0 pb-0 rounded  text-yellow-500">Feedback</div>}
            </span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="flex sm:hidden">
              {post.tag == "News" && <div className="p-0.5 rounded  text-green-500"><p>News</p></div>}
              {post.tag == "Miscellaneous" && <div className="p-0.5 rounded  text-pink-500">Miscellaneous</div>}
              {post.tag == "Discussion" && <div className="p-0.5 rounded  text-blue-500">Discussion</div>}
              {post.tag == "Question" && <div className="p-0.5 rounded  text-purple-600">Question</div>}
              {post.tag == "Announcement" && <div className="p-0.5 rounded  text-red-600">Announcement</div>}
              {post.tag == "Feedback" && <div className="p-0.5 rounded text-yellow-500">Feedback</div>}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-xl text-white font-semibold">
          <span>{post.title}</span>
        </div>
        <div className="post">
          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}></span>
        </div>
      </div>
      <hr className=" border-slate-600 " />
      <div className="flex flex-row gap-2 items-center text-slate-300">
        <button>
          <Link href={`/post/${post.id}`}><p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">view</p></Link>
        </button>
        <span> · </span>
        <button>
          <p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">share</p>
        </button>
        {!!user && user.id == author.id &&
          <div>
            <span> · </span>
            <button>
              <p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">edit</p>
            </button>
          </div>}
        {!!user && user.id == author.id &&
          <div>
            <span> · </span>
            <button onClick={() => { setToggleDelete(true); }}>
              <p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">delete</p>
            </button>
            {!!toggleDelete &&
              <div>
                <div className="mx-auto bg-black opacity-60 w-screen h-screen z-40 fixed inset-0 flex items-center"></div>
                <AnimatePresence>
                <motion.div className="mx-auto bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl shadow-black rounded-b-lg h-[10rem] z-50 p-8 sm:w-3/4 lg:w-[44rem] fixed inset-0"
                initial={{ y: '-100%'}}
                animate={{ y: 0}}
                exit={{ y: '-100%'}}>
                
                  <div className="flex flex-col">
                    <div className="flex flex-col">
                      <p className="text-xl font-semibold">Are you sure you want to delete this post?</p>
                      <p className="font-thin">This process cannot be undone.</p>
                    </div>
                    <div className="flex-grow"></div>
                    <div className="flex flex-row justify-end">
                      <button className="bg-red-700 hover:bg-red-800 duration-150  text-slate-50 font-bold py-2 px-4 border border-slate-700 rounded mr-4 ml-4 mt-2 mb-2" onClick={() => {mutate({postId: post.id}); setToggleDelete(false);}}>
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
    </motion.div>
  )

}

export default PostView;