
export const MyButton = (
    props: { 
        name?: string,
        onClick?: () => void
    }) => {
    return (
        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 border border-purple-700 rounded" onClick={props.onClick}>
            {props.name || "Post"}
        </button>
    )
};