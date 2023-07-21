import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { BsGithub } from "react-icons/bs";

export const SideBar = () => {

    const { user, isSignedIn } = useUser();



    return (
        <div className="block fixed z-20 w-[22rem] top-6">
            <div className="p-2 bg-gradient-to-t from-gray-950 to-gray-900 w-full border border-slate-800 shadow text-center shadow-black rounded-lg ">
                <h1 className="text-2xl font-bold tracking-widest">kbdspace</h1>
            </div>
            <div className="mt-4 p-5 bg-gradient-to-t from-gray-950 to-gray-900 w-full border border-slate-800 shadow shadow-black rounded-lg ">
                <div className="">
                    <div className="flex flex-col gap-3">
                        <div className="flex self-center">
                            {!isSignedIn && <SignInButton />}
                            {!!isSignedIn && <UserButton
                                appearance={{
                                    baseTheme: dark,
                                    elements: {
                                        avatarBox:
                                            "w-16 h-16",
                                    }
                                }}
                                userProfileMode="navigation"
                                userProfileUrl={
                                    typeof window !== "undefined"
                                        ? `${window.location.origin}/profile`
                                        : undefined
                                }
                            />}
                        </div>
                        <div className="flex flex-col text-center">
                            {!!isSignedIn && <span className="font-semibold">{user.fullName}</span>}
                            {!!isSignedIn && <span className="font-light">@{user.username}</span>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 p-5 bg-gradient-to-t from-gray-950 to-gray-900 w-full border border-slate-800 shadow shadow-black rounded-lg ">
            <h1 className="text-xl font-bold">Rules</h1><br />
                <hr className="mb-4 border-slate-600 "/>
                <p className="text">Please be respectful when posting on this website. Since this is a personal project meant to demonstrate my skills any disrespectful, vulgar, or unrelated content will be removed.</p><br /> 
                <p>I still encourage you to sign in with a Github account to make a post, ask questions, or leave feedback regarding the website! I would greatly appreciate it</p>   
            </div>
            <div className="mt-4 p-5 bg-gradient-to-t from-gray-950 to-gray-900 w-full border border-slate-800 shadow shadow-black rounded-lg ">
                <h1 className="text-xl font-bold">About</h1><br />
                <hr className="mb-4 border-slate-600 "/>
                <p className="text">KBDSpace is a social media platform built by Charles Hayes for mechanical keyboard enthusiasts. Dive into mechanical keyboard discussions!</p><br />
                <p className="text">This website is a personal project built from the ground up using the T3 web stack. Please visit the Github repo for this website if you wish to learn more.</p>
                <hr className="mt-4 mb-4 border-slate-600 "/>
                <a className="flex flex-row gap-2" href="https://github.com/chayesss/kbdspace"><BsGithub size='28'/><p>View Github Repository</p></a>
            </div>
        </div>
    )
}