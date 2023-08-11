import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { BsGithub } from "react-icons/bs";
import Image from "next/image";
import { MyLogo } from "./logo";
import Link from "next/link";

const ProfileSection = () => {

    const { user, isSignedIn } = useUser();

    if (!isSignedIn) {
        return (

            <div className=" p-5 ">
                <div className="flex flex-col gap-3">
                    <SignInButton>
                        <button className="bg-slate-100 hover:bg-slate-200 duration-150 text-slate-900 font-bold py-2 px-4 border border-slate-700 rounded mr-4 ml-4 mt-2 mb-2">
                            Login
                        </button>
                    </SignInButton>
                </div>
            </div>

        )
    }

    return (
        <div className="mt-4 p-5 bg-gradient-to-t from-gray-950 to-gray-900 w-full border border-slate-800 shadow shadow-black rounded-lg">
            <div className="flex flex-col gap-3">
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
                <div className="flex flex-col gap-3">
                    <Link href={`/@${user.username || ""}`}>
                    <button className="bg-sky-500 hover:bg-sky-600 duration-150 shadow-lg text-white font-bold py-2 w-full px-4 border border-sky-700 rounded ">
                        View Profile
                    </button>
                    </Link>
                    
                    <SignOutButton>
                        <button className="bg-slate-100 hover:bg-red-700 duration-150 text-slate-700 hover:text-white font-bold py-2 px-4 border border-slate-700 rounded ">
                            Logout
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </div>

    )
}


export const SideBar = () => {


    return (
        <div className="fixed z-20 w-[22rem] top-6">
            <div className="sticky p-2 flex justify-center">
                <Link href="/">
                    <MyLogo />
                </Link>
            </div>
            <div className="flex flex-col h-screen overflow-y-scroll no-scrollbar">
                <div className="">
                    <ProfileSection />
                </div>
                <div className="mt-4 p-5 bg-gradient-to-t from-gray-950 to-gray-900 w-full border border-slate-800 shadow shadow-black rounded-lg ">
                    <h1 className="text-xl font-bold">Rules</h1><br />
                    <hr className="mb-4 border-slate-600 " />
                    <p className="text">Please be respectful when posting on this website. Since this is a personal project meant to demonstrate my skills as a developer, any disrespectful, vulgar, or unrelated content will be removed.</p><br />
                    <p>I still encourage you to sign in with a Github account to make a post, ask questions, or leave feedback regarding the website! I would greatly appreciate it</p>
                </div>
                <div className="mt-4 mb-48 p-5 bg-gradient-to-t from-gray-950 to-gray-900 w-full border border-slate-800 shadow shadow-black rounded-lg ">
                    <h1 className="text-xl font-bold">About</h1><br />
                    <hr className="mb-4 border-slate-600 " />
                    <p className="text">KBDSpace is a social media platform built by Charles Hayes for mechanical keyboard enthusiasts. Dive into mechanical keyboard discussions!</p><br />
                    <p className="text">This website is a personal project built from the ground up using the T3 web stack. Please visit the Github repo for this website if you wish to learn more.</p>
                    <hr className="mt-4 mb-4 border-slate-600 " />
                    <a className="flex flex-row gap-2" href="https://github.com/chayesss/kbdspace"><BsGithub size='28' /><p>View Github Repository</p></a>
                </div>
            </div>

        </div>
    )
}