import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";

import { LoadingSpinner } from "~/components/loading";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { SideBar } from "~/components/sidebar";
import { BiFilterAlt } from "react-icons/bi";
import { IoCloseOutline } from "react-icons/io5";
import { MobileHeader } from "~/components/mobileheader";
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { useState } from "react";
dayjs.extend(relativeTime);



// section with sort by, filter, and create post button
const PostsManager = () => {

  const { isSignedIn } = useUser();

  const [creatingPost, setCreatingPost] = useState(false);

  const ctx = api.useContext();

    //TODO: REDIRECT TO HOME PAGE AFTER POSTING
    const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
        onSuccess: () => {

            setTitle("");
            setContent("");
            setTag("");
            setCreatingPost(false);


            void ctx.posts.getAll.invalidate();

        }
    });

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tag, setTag] = useState("News");

  return (
    <div className="flex flex-col gap-6">
      <div className="ml-2 mr-2 flex flex-row">
        <div className="flex items-center">
          <button className="w-[8rem] flex flex-row items-center text-lg gap-2">
            <BiFilterAlt size={24} />
            <p>Filter</p>
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="flex pl-2 items-center">
          {!isSignedIn &&
            <div className="flex flex-row items-center">
              <p> You must be logged in to create a post! </p>
              <button className="bg-sky-300 cursor-not-allowed duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded  ml-4 mt-2 mb-2" disabled>
                Create Post
              </button>
            </div>
          }
          {!!isSignedIn &&
            <button className="bg-sky-400 hover:bg-sky-600 duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded  ml-4 mt-2  " onClick={() => {setCreatingPost(true)}}>
              Create Post
            </button>}
        </div>
      </div>
      <AnimatePresence>

      
      {!!creatingPost &&
        <motion.div className="p-8 bg-gradient-to-t from-gray-950 to-gray-900 border border-slate-800 shadow shadow-black rounded-lg flex flex-col gap-4 w-full h-full"
        key="createPost"
        initial={{height: 0}}
        animate={{height: 600}}
        exit={{height: 0}}
        transition={{duration: .3, ease: easeInOut}}>

          <div className="flex flex-row items-center">
            <h1 className="text-3xl font-bold">Create Post</h1>
            <div className="flex-grow"></div>
            <button>
              <IoCloseOutline size={42} onClick={() => {setCreatingPost(false)}}/>
            </button>
          </div>
          <hr className=" border-slate-600 " />
          <p>All fields marked with * are required</p>
          <label className="text-2xl  font-semibold" htmlFor="title">Title*</label>
          <input
            className="border-2 border-slate-800 bg-transparent rounded-md w-1/2 focus:outline-none focus:ring-0 focus:border-slate-400 focus:bg-gray-950 peer"
            type="text"
            placeholder=" Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isPosting}
          />
          <label className="text-2xl font-semibold" htmlFor="tag">Tag*</label>
          <select
            className="block py-2.5 w-1/6 px-1 text-sm bg-transparent border-2 rounded-md border-slate-800 focus:outline-none focus:ring-0 focus:border-slate-400 focus:bg-gray-950 peer"
            name="tag"
            placeholder="tag"
            value={tag}
            required
            onChange={(e) => setTag(e.target.value)} >
            <option value="News">News</option>
            <option value="Meme">Meme</option>
            <option value="Discussion">Discussion</option>
            <option value="Question">Question</option>
            <option value="Announcement">Announcement</option>
          </select>
          <label className="text-2xl font-semibold" htmlFor="content">Content*</label>
          <textarea
            className="border-2 border-slate-800 bg-transparent rounded-md h-32 focus:outline-none focus:ring-0 focus:border-slate-400 focus:bg-gray-950 peer"
            placeholder=" Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={isPosting}
          />
          <button className="bg-sky-400 hover:bg-sky-600 duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded mt-2 mb-2" onClick={() => mutate({ title: title, content: content, tag: tag })}>
            Post
          </button>
        </motion.div>}
        </AnimatePresence>
    </div>
  )

};




type PostWithUser = RouterOutputs["posts"]["getAll"][number];
//creates individual post view
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <motion.div key={post.id} className="p-8 bg-gradient-to-t from-gray-950 to-gray-900 border border-slate-800 shadow shadow-black rounded-lg flex flex-row gap-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: .5, ease: "easeInOut", staggerChildren: 0.5, delayChildren: 0.5 }}
    >

      <div className=" flex-shrink-0">
        <Image
          src={author.profileImageUrl}
          alt="pfp"
          className="rounded-full w-12 h-12"
          width={48}
          height={48}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-xl font-semibold">
          <span>{post.title}</span>
        </div>
        <div className="text-slate-300">
          <span>{post.content}</span>
        </div>
        <div className="flex flex-row gap-2">
          <span className="font-semibold">@{author.username}</span>
          <span> · </span>
          <span className="font-thin">{`  ${dayjs(post.createdAt).fromNow()}`}</span>
          <span> · </span>
          <span className="font">
            {post.tag == "News" && <div className="border p-0.5 rounded border-green-500 text-green-500"><p>News</p></div>}
            {post.tag == "Meme" && <div className="border p-0.5 rounded border-pink-500 text-pink-500">Meme</div>}
            {post.tag == "Discussion" && <div className="border p-0.5 rounded border-blue-500 text-blue-500">Discussion</div>}
            {post.tag == "Question" && <div className="border p-0.5 rounded border-purple-600 text-purple-600">Question</div>}
            {post.tag == "Announcement" && <div className="border p-0.5 rounded border-red-600 text-red-600">Announcement</div>}
            {post.tag == "Feedback" && <div className="border p-0.5 rounded border-yellow-500 text-yellow-500">Feedback</div>}
          </span>
        </div>
      </div>
    </motion.div>
  )

}






// section with all posts
const FrontPage = () => {

  const { data } = api.posts.getAll.useQuery();

  if (!data) return (<LoadingSpinner />);


  return (
    <div className="flex flex-col mt-4 gap-4">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />))}
    </div>
  )
};




export default function Home() {

  const { isLoaded: userLoaded } = useUser();

  // start fetching posts
  api.posts.getAll.useQuery();

  // return empty div if user not loaded
  if (!userLoaded) return <LoadingSpinner />;



  return (
    <>
      <Head>
        <title>kbdspace</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main>
        <div>
          <MobileHeader />
        </div>
        <div className="flex flex-col sm:flex-row justify-center h-full gap-4 m-4 pt-16 lg:pt-0">
          <div className="hidden lg:block flex-shrink-0 w-[22rem] mr-4 h-screen">
            <SideBar />
          </div>
          <div className="w-full max-w-6xl ">
            <div className="">
              <PostsManager />
            </div>
            <div>
              <FrontPage />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
