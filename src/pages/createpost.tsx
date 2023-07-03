import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";
import { dark } from "@clerk/themes";

import { LoadingSpinner } from "~/components/loading";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { useState } from "react";
import { MyButton } from "~/components/custombutton";
dayjs.extend(relativeTime);



// create post form with title, content, and submit button
const CreatePostForm = () => {

    const { mutate } = api.posts.create.useMutation();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    return (
        <div className="flex flex-col gap-4">
            <label className="text-2xl  font-semibold" htmlFor="title">Title</label>
            <input
                className="border-2 border-gray-300 bg-transparent rounded-md"
                type="text"
                placeholder=" Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <label className="text-2xl font-semibold" htmlFor="content">Content</label>
            <textarea
                className="border-2  border-gray-300 bg-transparent rounded-md"
                placeholder=" Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <MyButton name="Post" onClick={() => mutate({ title: title, content: content })}></MyButton>
        </div>
    )
};



export default function Home() {

    const { user, isLoaded: userLoaded, isSignedIn } = useUser();



    // return empty div if user not loaded
    if (!userLoaded) return <LoadingSpinner />;



    return (
        <>
            <Head>
                <title>kbdspace</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <main className="flex justify-center h-screen">
                <div className="w-full md: max-w-5xl border-x">
                    <div className="flex flex-row border-b p-4">
                        <div className="w-full flex self-center">
                            <h1 className="text-2xl font-bold tracking-widest">kbdspace</h1>
                        </div>
                        <div className="flex w-full justify-end">
                            <div className="flex flex-row gap-3">
                                <div className="flex flex-col text-right">
                                    {!!isSignedIn && <span className="font-semibold">{user.fullName}</span>}
                                    {!!isSignedIn && <span className="font-light">@{user.username}</span>}
                                </div>
                                <div className="flex self-center">
                                    {!isSignedIn && <SignInButton />}
                                    {!!isSignedIn && <UserButton
                                        appearance={{
                                            baseTheme: dark,
                                            elements: {
                                                avatarBox:
                                                    "w-12 h-12",
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

                            </div>

                        </div>
                    </div>
                    <div className="flex flex-col border-b p-4">
                        <CreatePostForm />
                    </div>
                </div>
            </main>
        </>
    );
}