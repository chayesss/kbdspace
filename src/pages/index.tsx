import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { LoadingSpinner } from "~/components/loading";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { SideBar } from "~/components/sidebar";
import { BiFilterAlt } from "react-icons/bi";
import { IoCreateOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { MobileHeader } from "~/components/mobileheader";
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import dynamic from "next/dynamic";

import 'react-quill/dist/quill.snow.css';
dayjs.extend(relativeTime);

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

let sortState = "getAllAsc";

// section with sort by, filter, and create post button
const PostsManager = () => {

  const { isSignedIn } = useUser();

  const [creatingPost, setCreatingPost] = useState(false);
  const [filtering, setFiltering] = useState(false);

  const ctx = api.useContext();

  const variants = {
    closed: { height: 0, marginTop: 0 },
    open: { height: 'auto', marginTop: "1.5rem" },
  };


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

  const [filterBy, setFilterBy] = useState("*");

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.value === "newest") {
      sortState = "getAll";
    } else {
      sortState = "getAllAsc";
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterBy(e.target.value);
  };

  return (
    <div className="flex flex-col">
      <div className="ml-2 mr-2 flex flex-row">
        <div className="flex items-center">
          <button className="w-[8rem] flex flex-row items-center text-lg gap-2" onClick={() => { setFiltering(true) }}>
            <BiFilterAlt size={24} />
            <p>Filter</p>
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="flex pl-2 items-center">
          {!isSignedIn &&
            <div className="flex flex-row items-center justify-end">
              <button className="w-[9rem] flex flex-row justify-end items-center text-slate-400 cursor-not-allowed text-lg gap-2" disabled onClick={() => { setCreatingPost(true) }}>
                <p>Login to post</p> <IoCreateOutline size={24} />
              </button>
            </div>
          }
          {!!isSignedIn &&
            <button className="w-[8rem] flex flex-row items-center text-lg gap-2" onClick={() => { setCreatingPost(true) }}>
              <p>Create Post</p><IoCreateOutline size={24} />
            </button>}
        </div>
      </div>
      <AnimatePresence>
        {!!filtering &&
          <motion.div className="p-4 overflow-hidden"
            key="createPost"
            initial="closed"
            animate="open"
            variants={variants}
            exit="closed"
            layout
            transition={{ duration: .75, ease: easeInOut }}>

            <table className="flex flex-col gap-1">
              <thead>
                <tr className="flex flex-row gap-[4rem]">
                  <th className="border-b w-[6rem] pb-1 flex justfiy-start border-gray-600">Sort By</th>
                  <th className="border-b w-[6rem] flex justfiy-start border-gray-600">Tag</th>
                </tr>
              </thead>
              <tbody className="flex text-slate-400 flex-row gap-[6.5rem]">
                <tr className="flex flex-col">
                  <td className="">
                    <input type="radio" name="sort" id="newest" className="hidden peer" value="newest" onChange={handleSortChange}/>
                    <label htmlFor="newest" className="radio-label cursor-pointer peer-checked:text-white">Newest</label>
                  </td>
                  <td>
                    <input type="radio" name="sort" id="oldest" className="hidden peer" value="oldest" onChange={handleSortChange}/>
                    <label htmlFor="oldest" className="radio-label cursor-pointer peer-checked:text-white">Oldest</label>
                  </td>
                </tr>
                <tr className="flex flex-col">
                  <td>
                    <input type="radio" name="tag" id="news" className="hidden peer" value="News" onChange={handleFilterChange}/>
                    <label htmlFor="news" className="radio-label cursor-pointer peer-checked:text-white">News</label>
                  </td>
                  <td>
                    <input type="radio" name="tag" id="Discussion" className="hidden peer" value="Discussion" onChange={handleFilterChange}/>
                    <label htmlFor="Discussion" className="radio-label cursor-pointer peer-checked:text-white">Discussion</label>
                  </td>
                  <td>
                    <input type="radio" name="tag" id="question" className="hidden peer" value="Question" onChange={handleFilterChange}/>
                    <label htmlFor="question" className="radio-label cursor-pointer peer-checked:text-white">Question</label>
                  </td>
                  <td>
                    <input type="radio" name="tag" id="miscellaneous" className="hidden peer" value="Miscellaneous" onChange={handleFilterChange}/>
                    <label htmlFor="miscellaneous" className="radio-label cursor-pointer peer-checked:text-white">Miscellaneous</label>
                  </td>
                  <td>
                    <input type="radio" name="tag" id="feedback" className="hidden peer" value="Feedback" onChange={handleFilterChange}/>
                    <label htmlFor="feedback" className="radio-label cursor-pointer peer-checked:text-white">Feedback</label>
                  </td>
                  <td>
                    <input type="radio" name="tag" id="announcement" className="hidden peer" value="Announcement" onChange={handleFilterChange}/>
                    <label htmlFor="announcement" className="radio-label cursor-pointer peer-checked:text-white">Announcement</label>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>}
      </AnimatePresence>
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
              <ReactQuill
                id="content"
                value={content}
                onChange={(e) => setContent(e)}
                className="h-[12rem] pb-8"
              />
              <button className="bg-sky-400 hover:bg-sky-600 duration-150 text-white font-bold py-2 px-4 border border-sky-700 rounded mt-2 mb-2" onClick={() => mutate({ title: title, content: content, tag: tag })}>
                Post
              </button>
            </div>

          </motion.div>}
      </AnimatePresence>
    </div>
  )

};

const getPostsQuery = (sortState: string) => {
  const {data} = sortState === "getAll" ? api.posts.getAll.useQuery() : api.posts.getAllAsc.useQuery();

  return data;
}


// section with all posts
const FrontPage = () => {

  const data = getPostsQuery(sortState);



  

  if (!data) return (<LoadingSpinner />);

  


  return (
    <div className="flex flex-col gap-4 mt-6">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />))}
    </div>
  )
};




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
              <span className="font-semibold">@{author.username}</span>
              <span> · </span>
            </div>
            <div className="flex flex-row gap-2">
              <span className="font-thin">{`  ${dayjs(post.createdAt).fromNow()}`}</span>
              <span className="hidden sm:flex"> · </span>
            </div>
            <span className="hidden items-center sm:flex">
              {post.tag == "News" && <div className="border p-1 pt-0 pb-0 mt-0 mb-0 rounded border-green-500 text-green-500"><p>News</p></div>}
              {post.tag == "Meme" && <div className="border p-0.5 pt-0 pb-0 rounded border-pink-500 text-pink-500">Meme</div>}
              {post.tag == "Discussion" && <div className="border p-0.5 pt-0 pb-0 rounded border-blue-500 text-blue-500">Discussion</div>}
              {post.tag == "Question" && <div className="border p-0.5 pt-0 pb-0 rounded border-purple-600 text-purple-600">Question</div>}
              {post.tag == "Announcement" && <div className="border p-0.5 pt-0 pb-0 rounded border-red-600 text-red-600">Announcement</div>}
              {post.tag == "Feedback" && <div className="border p-0.5 pt-0 pb-0 rounded border-yellow-500 text-yellow-500">Feedback</div>}
            </span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="flex sm:hidden">
              {post.tag == "News" && <div className="border p-0.5 rounded border-green-500 text-green-500"><p>News</p></div>}
              {post.tag == "Meme" && <div className="border p-0.5 rounded border-pink-500 text-pink-500">Meme</div>}
              {post.tag == "Discussion" && <div className="border p-0.5 rounded border-blue-500 text-blue-500">Discussion</div>}
              {post.tag == "Question" && <div className="border p-0.5 rounded border-purple-600 text-purple-600">Question</div>}
              {post.tag == "Announcement" && <div className="border p-0.5 rounded border-red-600 text-red-600">Announcement</div>}
              {post.tag == "Feedback" && <div className="border p-0.5 rounded border-yellow-500 text-yellow-500">Feedback</div>}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-xl font-semibold">
          <span>{post.title}</span>
        </div>
        <div className="text-slate-300">
          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}></span>
        </div>
      </div>
      <hr className=" border-slate-600 " />
      <div className="flex flex-row gap-2 items-center text-slate-300">
      <button>
              <p className="hover:text-white hover:decoration:stroke duration-100 hover:underline">view</p>
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
