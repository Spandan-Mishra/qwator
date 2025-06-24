"use client";

import { SkeletonCard } from "@/components/ui/skeletonCard";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Task() {
    const params = useParams();
    const taskId = params.taskId as string;

    const [result, setResult] = useState<Record<string, { votes: number, image_url: string }> | null>(null);
    const [taskDetails, setTaskDetails] = useState<{ title?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getTaskDetails = async (taskId: string) => {
            setLoading(true);
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/task?taskId=${taskId}`, {
                    headers: {
                        'Authorization': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzUwNzgxMTc1fQ.oJQxGVF2tDO3pQ86HNvYZISoXRWKpNMuAbDVwkrLVQs"
                    }
                });
                setResult(res.data.result);
                setTaskDetails(res.data.taskDetails);
            } catch (error: any) {
                setResult(null);
                setTaskDetails(null);
            }
            setLoading(false);
        };
        getTaskDetails(taskId);
    }, [taskId]);

    if(loading) {
        return (
            <div className="flex items-center justify-center flex-wrap gap-8 mt-8">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        )
    }

    if (result === null) {
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="text-2xl text-red-600 font-bold">You are not authorized to view this page</div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center text-2xl m-4 font-bold">
                {taskDetails?.title}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 mb-4">
                {Object.keys(result).map((optionId) => (
                    <div key={optionId}>
                        <img src={result[optionId].image_url} alt={`uploaded ${optionId}`} className="w-80 h-52 object-cover rounded-md shadow-xl" />
                        <div className="text-center text-xl">
                            {result[optionId].votes}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}