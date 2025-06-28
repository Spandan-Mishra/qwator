"use client";

import { useEffect, useState } from "react";
import type { Task } from "@repo/types"
import axios from "axios";
import { SkeletonCard } from "@/components/ui/skeletonCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Submission() {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!task || !task.id) {
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/voter/submission`, {
                task_id: task.id,
                option_id: selectedOption
            }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            })

            const nextTask = res.data.task;
            setTask(nextTask);
            setTask(nextTask);
        } catch (error: any) {
            toast.error("Failed to submit the task");
        }
        setSubmitting(false);
        setSelectedOption(null);
    }

    useEffect(() => {
        const getTask = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/voter/nextTask`, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                })
                setTask(res.data.task)
            } catch (error: any) {
                setTask(null);
            }
            setLoading(false);
        }
        getTask();
    }, [])

    if(loading) {
        return (
            <div className="flex items-center justify-center flex-wrap gap-8 mt-8">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex flex-col flex-wrap items-center justify-center">
                <div className="text-2xl font-bold">No tasks available. Please check back later.</div>
            </div>
        );
    }

        return (
        <div className="flex flex-col items-center justify-center">
            <div className="text-center text-2xl m-4 font-bold">
                {task.title}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 mb-4">
                {task.options.map((option) => (
                    <div key={option.id}>
                        <img src={option.image_url} alt={`uploaded ${option.id}`} className="w-80 h-52 object-cover rounded-md shadow-xl" onClick={() => setSelectedOption(option.id)} />
                    </div>
                ))}
            </div>
            <Button onClick={handleSubmit} disabled={selectedOption === null || submitting} className="cursor-pointer">
                {submitting ? "Submitting..." : "Submit"}
            </Button>
        </div>
    );
}