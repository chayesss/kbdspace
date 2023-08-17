import { useUser } from "@clerk/nextjs";
import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import toast from "react-hot-toast";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
dayjs.extend(relativeTime);




type PostWithUser = RouterOutputs["posts"]["getAll"][number];
//creates individual post view
const PostView = (props: PostWithUser & { isFullPost: boolean }) => {
  const { post, author, isFullPost } = props;
  const { user } = useUser();

  const [toggleDelete, setToggleDelete] = useState(false);
  const [toggleEdit, setToggleEdit] = useState(false);

  const ctx = api.useContext();

  const { mutate: deletePost } = api.posts.delete.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
      void ctx.posts.count.invalidate();
      void ctx.posts.getByUserId.invalidate();
      toast.success("Post deleted");
    },
    onError: () => {
      toast.error("Error deleting post");
    }
  });

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tag, setTag] = useState(post.tag);

  const { mutate: editPost } = api.posts.edit.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
      void ctx.posts.count.invalidate();
      void ctx.posts.getByUserId.invalidate();
      toast.success("Post edited");
    },
    onError: () => {
      toast.error("Error editing post");
    }
  });

  //character limit for on home page
  const rawContent = DOMPurify.sanitize(post.content);
  const wordLimit = 100;

  const words = rawContent.split(/\s+/).filter(word => word.trim() !== '');
  const displayWords = words.slice(0, wordLimit);

  const isContentExceeded = words.length > wordLimit;

  const [count, setCount] = useState(post.content.replace(/(<([^>]+)>)/gi, "").length);
  const [titleCount, setTitleCount] = useState(post.title.length);


  const commentCount = api.comments.countByPostId.useQuery({ postId: post.id });


  return (
    <motion.div key={post.id} className="p-8 bg-gradient-to-t from-gray-950 to-gray-900 border border-slate-800 shadow shadow-black rounded-lg flex flex-col gap-2"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: .5, ease: "easeInOut", staggerChildren: 0.5, delayChildren: 0.5 }}
    >

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

        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2">
            <div className="flex flex-row gap-2">
              <Link href={`/@${author.username || ""}`}><span className="font-semibold hover:underline">@{author.username}</span></Link>
              <span> · </span>
            </div>
            <div className="flex flex-row gap-2">
              <span className="font-thin">{`  ${dayjs(post.createdAt).fromNow()}`} </span>
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
          <Link href={`/post/${post.id}`}>
            <span>{post.title}</span>
          </Link>

        </div>
        {(!!isContentExceeded && !isFullPost) ?
          <div className="post">
            <span dangerouslySetInnerHTML={{ __html: displayWords.join(" ") + "... <a href='/post/" + post.id + "' class='inline hover:underline'>Read more</a>" }}></span>
          </div> :
          <div className="post">
            <span dangerouslySetInnerHTML={{ __html: rawContent }}></span>
          </div>
        }

      </div>
      <hr className=" border-slate-600 " />
      <div className="flex flex-row gap-2 items-center text-slate-300">
        {!isFullPost &&
          <div>
            <button>
              <Link href={`/post/${post.id}`}><p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">{commentCount.data} comments</p></Link>
            </button>
          </div>
        }
        {!!user && user.id == author.id &&
          <div>
            {!isFullPost && <span> · </span>}
            <button onClick={() => setToggleEdit(true)}>
              <p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">edit</p>
            </button>
            {!!toggleEdit &&
              <div>
                <div className="mx-auto bg-black opacity-60 w-screen h-screen z-40 fixed inset-0 flex items-center" onClick={() => setToggleEdit(false)}></div>
                <AnimatePresence>
                  <motion.div className="mx-auto bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl shadow-black rounded-b-lg h-[49.5rem] z-50 p-8 sm:w-3/4 lg:w-[44rem] fixed inset-0"
                    initial={{ y: '-100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-100%' }}>

                    <div className="flex flex-row">

                      <h1 className="text-3xl font-bold">Edit Post</h1>
                      <div className="flex-grow"></div>

                    </div>
                    <div className=" flex flex-col gap-4 w-full">
                      <hr className=" border-slate-600 mt-2" />
                      <p>All fields marked with * are required</p>
                      <div className="w-1/2 flex flex-col">
                        <label className="text-2xl pb-4 font-semibold" htmlFor="title">Title*</label>
                        <input
                          className="border-2 border-slate-800 bg-transparent rounded-md pb-1 focus:outline-none focus:ring-0 focus:border-slate-400 focus:bg-gray-950 peer"
                          type="text"
                          placeholder=" Title"
                          value={title}
                          onChange={(e) => { setTitle(e.target.value); setTitleCount(e.target.value.length) }}
                          required
                        />
                        <div className="flex justify-end">
                          {titleCount > 250 &&
                            <p className="text-red-500">
                              {titleCount}/250
                            </p>}
                          {titleCount <= 250 &&
                            <p className="text-slate-300">
                              {titleCount}/250
                            </p>
                          }
                        </div>
                      </div>

                      <label className="text-2xl font-semibold" htmlFor="tag">Tag*</label>
                      <select
                        className="block py-2.5 w-1/6 px-1 text-sm bg-transparent border-2 rounded-md border-slate-800 focus:outline-none focus:ring-0 focus:border-slate-400 focus:bg-gray-950 peer"
                        name="tag"
                        placeholder="tag"
                        value={tag}
                        required
                        onChange={(e) => setTag(e.target.value)} >
                        <option disabled value="">Choose Tag</option>
                        <option value="Feedback">Feedback</option>
                        <option value="News">News</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                        <option value="Discussion">Discussion</option>
                        <option value="Question">Question</option>
                        <option value="Announcement">Announcement</option>
                      </select>
                      <label className="text-2xl font-semibold" htmlFor="content">Content*</label>
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
                      {(count > 0 && count < 2000) && (titleCount > 0 && titleCount < 250) && (tag !== "") ?
                        <button className="bg-sky-400 hover:bg-sky-600 duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded mt-2 " onClick={() => { editPost({ postId: post.id, title: title, content: content, tag: tag }); setToggleEdit(false); }}>
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
          <div>
            <span> · </span>
            <button onClick={() => { setToggleDelete(true); }}>
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
                        <p className="text-xl font-semibold">Are you sure you want to delete this post?</p>
                        <p className="font-thin">This process cannot be undone.</p>
                      </div>
                      <div className="flex-grow"></div>
                      <div className="flex flex-row justify-end">
                        <button className="bg-red-700 hover:bg-red-800 duration-150  text-slate-50 font-bold py-2 px-4 border border-slate-700 rounded mr-4 ml-4 mt-2 mb-2" onClick={() => { deletePost({ postId: post.id }); setToggleDelete(false); }}>
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