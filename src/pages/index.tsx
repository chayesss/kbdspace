import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { SideBar } from "~/components/sidebar";
import { IoCreateOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { MobileHeader } from "~/components/mobileheader";
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { useState } from "react";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
import toast from "react-hot-toast";
import PostView from "~/components/postview";
dayjs.extend(relativeTime);

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });



// section with sort by, filter, and create post button
const PostsManager = () => {

  const { isSignedIn } = useUser();

  const [creatingPost, setCreatingPost] = useState(false);

  const ctx = api.useContext();

  const variants = {
    closed: {
      height: 0,
      marginTop: 0,
    },
    open: {
      height: 'auto',
      marginTop: "1.5rem",
    },
  };


  


  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {

      setTitle("");
      setContent("");
      setTag("");
      setCreatingPost(false);


      void ctx.posts.getAll.invalidate();

    },
    onError: (e) => {

      const errorMessage = e.data?.code?.toString();

      if (errorMessage) {
        toast.error(errorMessage);
      }
    }
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");

  const [count, setCount] = useState(content.replace(/(<([^>]+)>)/gi, "").length);
  const [titleCount, setTitleCount] = useState(title.length);

  return (
    <div className="flex flex-col">
      <div className="ml-2 mr-2 flex flex-row">
        <div className="flex-grow"></div>
        <div className="flex pl-2 items-center">
          {!isSignedIn &&
            <div className="flex flex-row items-center justify-end">
              <button className="w-[9rem] flex flex-row justify-end items-center text-slate-400 cursor-not-allowed text-lg gap-2" disabled >
                <p>Login to post</p> <IoCreateOutline size={24} />
              </button>
            </div>
          }
          {!!isSignedIn &&
            <button className="w-[8rem] flex flex-row items-center text-lg gap-2" onClick={() => { setCreatingPost(true);  }}>
              <p>Create Post</p><IoCreateOutline size={24} />
            </button>}
        </div>
      </div>
      <AnimatePresence>
        {!!creatingPost &&
          <motion.div className="overflow-hidden"
            key="createPost"
            initial="closed"
            animate="open"
            variants={variants}
            exit="closed"
            layout
            transition={{ duration: .75, ease: easeInOut }}>

            <div className="flex flex-row">

              <h1 className="text-3xl font-bold">Create Post</h1>
              <div className="flex-grow"></div>
              <button>
                <IoCloseOutline size={42} onClick={() => { setCreatingPost(false) }} />
              </button>

            </div>
            <div className=" flex flex-col gap-4 w-full">
              <hr className=" border-slate-600 mt-2" />
              <p>All fields marked with <span className="text-red-500">*</span>  are required</p>
              <div className="w-1/2 flex flex-col">
                <label className="text-2xl pb-4 font-semibold" htmlFor="title">Title<span className="text-red-500">*</span></label>
                <input
                  className="border-2 border-slate-800 pl-2 bg-transparent rounded-md pb-1 focus:outline-none focus:ring-0 focus:border-slate-400 focus:bg-gray-950 peer"
                  type="text"
                  placeholder=" Title"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setTitleCount(e.target.value.length) }}
                  required
                  disabled={isPosting}
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

              <label className="text-2xl font-semibold" htmlFor="tag">Tag<span className="text-red-500">*</span></label>
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
              <label className="text-2xl font-semibold" htmlFor="content">Content<span className="text-red-500">*</span></label>
              <ReactQuill
                id="content"
                value={content}
                onChange={(e) => { setContent(e); setCount(e.replace(/(<([^>]+)>)/gi, "").length) }}
                className="h-[12rem] pb-16 sm:pb-8"
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
              {(count > 0 && count <= 10000) && (titleCount > 0 && titleCount <= 250) && (tag !== "") ?
                <button className="bg-sky-400 hover:bg-sky-600 duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded mt-2 mb-2" disabled={isPosting} onClick={() => mutate({ title: title, content: content, tag: tag })}>
                  Post
                </button> :
                <button className="bg-sky-800 duration-150 text-slate-400 cursor-not-allowed font-bold py-2 px-4 border border-sky-700 rounded mt-2 mb-2" disabled >
                  Post
                </button>
              }

            </div>

          </motion.div>}
      </AnimatePresence>
    </div>
  )

};




// section with all posts
const FrontPage = () => {

  const { data } = api.posts.getAll.useQuery();



  if (!data) return (<LoadingSpinner />);



  return (
    <div className="flex flex-col gap-4 mt-6">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} isFullPost={false} />))}
    </div>
  )
};


// main page
export default function Home() {

  const { isLoaded: userLoaded } = useUser();

  // start fetching posts
  api.posts.getAll.useQuery();

  // return empty div if user not loaded
  if (!userLoaded) return <LoadingSpinner />;



  return (
    <>
      <Head>
        <title>Home / KBDSpace</title>
        <meta name="description" content="KBDSpace is a mechanical keyboard discussion forum for enthusiasts!" />
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
