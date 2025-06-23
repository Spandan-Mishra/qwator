
export default function Submit() {
    return (
    <div className="flex flex-col items-center justify-center">
        <div>user page</div>
        <label
            htmlFor="files"
            className="w-20 h-20 border border-black cursor-pointer flex justify-center items-center"
        >
            <input
            type="file"
            className="hidden"
            id="files"
            multiple
            />
            +
        </label>
      </div> 
    )
}