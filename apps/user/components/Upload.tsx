"use client";
import axios from "axios";
import React, { useState } from "react"
import UploadImage from "./UploadImage";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Upload() {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const router = useRouter();

    const handleImageAdd = (images: string[]) => {
        setImages(prev => [...prev, ...images]);
    }

    const handleSubmit = async () => {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/task`, {
            title,
            options: images.map(image => {
                return {
                    image_url: image
                }
            }),
            signature: 'test', // TODO: add signature
            amount: 1 // TODO: add amount
        }, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        })

        router.push(`/task/${res.data.id}`)
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 gap-4 w-1/2">
            <label>Task Title</label>
            <input 
            type="text" 
            placeholder="Add Task Title" 
            className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            onChange={e => setTitle(e.target.value)} required
            />
            <div className="flex flex-wrap justify-center items-center gap-8 mb-4">
                {images.map((image, index) => (
                    <img key={index} src={image} alt={`uploaded ${index + 1}`} className="w-80 h-52 object-cover rounded-md shadow-xl" />
                ))}
            </div>
            <UploadImage onImageAdd={handleImageAdd} />
            <Button variant={"secondary"} className="cursor-pointer mt-4" onClick={handleSubmit}>Submit</Button>
        </div>
    )
}