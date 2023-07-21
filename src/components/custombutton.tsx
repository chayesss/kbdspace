
export const MyButton = (
    props: { 
        name?: string,
        onClick?: () => void
    }) => {
    return (
        <button className="bg-sky-500 hover:bg-sky-600 duration-150 shadow-lg shadow-sky-500/50 text-white font-bold py-2 px-4 border border-sky-700 rounded" onClick={props.onClick}>
            {props.name || "Post"}
        </button>
    )
};