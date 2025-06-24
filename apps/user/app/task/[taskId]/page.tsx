import { useRouter } from "next/navigation";

export default function Task({ params : { taskId } }: { params: { taskId: string } }) {

    return (
        <div className="flex flex-col items-center justify-center">
            <div>task page</div>
            <div>task id: {taskId}</div>
        </div>
    )
}