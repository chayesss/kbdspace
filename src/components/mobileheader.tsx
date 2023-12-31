import { BiMenuAltRight } from "react-icons/bi";
import { IoCloseOutline } from "react-icons/io5";
import { MyLogo } from "~/components/logo";
import { useState } from "react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { BsGithub } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";





const ProfileSection = () => {

  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div className="flex mt-6 flex-col gap-3">
        <SignInButton>
          <button className="bg-slate-100 hover:bg-slate-200 duration-150 text-slate-900 font-bold py-2 px-4 border border-slate-700 rounded mr-4 ml-4 mt-2 mb-2">
            Login
          </button>
        </SignInButton>
      </div>

    )
  }

  return (
    <div className="flex mt-6 flex-col gap-3">
      <div className="flex self-center">
        {!!isSignedIn && <span><Image
          src={user.profileImageUrl}
          alt="pfp"
          className="rounded-full w-16 h-16"
          width={64}
          height={64}
        /></span>}

      </div>
      <div className="flex flex-col text-center">
        {!!isSignedIn && <span className="font-semibold">{user.fullName}</span>}
        {!!isSignedIn && <span className="font-light">@{user.username}</span>}
      </div>
      <div className="flex flex-col">
        <Link className="mx-4" href={`/@${user.username || ""}`}>
          <button className="bg-sky-500 hover:bg-sky-600 duration-150 shadow-lg text-white font-bold py-2 w-full px-4 border border-sky-700 rounded ">
            View Profile
          </button>
        </Link>
        <SignOutButton>
          <button className="bg-slate-100 hover:bg-red-700 duration-150 text-slate-700 hover:text-white font-bold py-2 px-4 border border-slate-700 rounded mr-4 ml-4 mt-2 mb-2">
            Logout
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}

export const MobileHeader = () => {


  const [toggle, setToggle] = useState(false);


  return (

    <div className="border-b-2 bg-gradient-to-r from-gray-950 to-gray-900 fixed w-full top-0 border-slate-800 lg:hidden">
      <div className="flex flex-row ml-4 mr-4 mt-4 mb-2 lg:hidden">
        <Link href="/">
          <MyLogo width="200" height="40" />
        </Link>
        <div className="flex-grow"></div>

        {/*MOBILE MENU*/}
        <div className="flex items-center justify-end">
          <BiMenuAltRight size={42} className="cursor-pointer" onClick={() => setToggle(true)} />
          <AnimatePresence>
            {toggle && (
              <div>
                <motion.div className="fixed top-0 left-0 w-5/6 sm:w-[33.5rem] h-full bg-black bg-gradient-to-tl from-gray-900 via-gray-950 z-50 flex flex-col shadow-lg shadow-black-100/100 overflow-y-auto"
                  key='mobile-menu'
                  animate={{ x: [-600, 0,] }}
                  exit={{ x: [0, -600] }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}>

                  <div className="sticky backdrop-blur-xl z-10 w-full sm:w-[33.5rem]  ">
                    <div className="flex flex-row items-center">
                      <div className="m-4">
                        <MyLogo width="200" height="40" />
                      </div>
                      <div className="flex-grow"></div>
                      <div className="m-4">
                        <IoCloseOutline className="cursor-pointer" onClick={() => setToggle(false)} size={42} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <ProfileSection />
                  </div>
                  <div className="join pb-20 join-vertical w-full rounded-none">
                    <div className="collapse collapse-arrow join-item border-slate-600 ">
                      <input type="checkbox" name="peer" />
                      <div className="collapse-title text-xl font-medium">
                        Rules
                      </div>
                      <div className="collapse-content">
                        <p className="text">Please be respectful when posting on this website. Since this is a personal project meant to demonstrate my skills as a developer, any disrespectful, vulgar, or unrelated content will be removed.</p><br />
                        <p>I still encourage you to sign in with a Github account to make a post, ask questions, or leave feedback regarding the website! I would greatly appreciate it</p>
                      </div>
                    </div>
                    <div className="collapse collapse-arrow join-item border-t border-slate-600 ">
                      <input type="checkbox" name="peer" />
                      <div className="collapse-title text-xl font-medium">
                        About
                      </div>
                      <div className="collapse-content">
                        <p className="text">KBDSpace is a social media platform built by Charles Hayes for mechanical keyboard enthusiasts. Dive into mechanical keyboard discussions!</p><br />
                        <p className="text">This website is a personal project built from the ground up using the T3 web stack. Please visit the Github repo for this website if you wish to learn more.</p>
                      </div>
                    </div>
                  </div>
                  <div className="fixed backdrop-blur-xl flex bottom-0 p-4 w-5/6 sm:w-[33.5rem] border-t border-slate-600">
                    <a className="flex flex-row gap-2" href="https://github.com/chayesss/kbdspace"><BsGithub size='28' /><p>View Github Repository</p></a>
                  </div>
                </motion.div>
                <div className="mx-auto bg-black opacity-60 w-screen h-screen z-40 fixed inset-0 flex items-center" onClick={() => setToggle(false)}>

                </div>
              </div>

            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

}