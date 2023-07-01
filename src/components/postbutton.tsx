
export const PostButton = (props: { name?: string}) => {
    return (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">
            {props.name || "Post"}
        </button>
    )
};