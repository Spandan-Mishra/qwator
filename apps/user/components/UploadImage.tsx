import axios from "axios";
import { useState } from "react";

export default function UploadImage({ onImageAdd }: {
    onImageAdd: (images: string[]) => void
}) {
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) {
            return;
        }

        setIsUploading(true);

        const uploadPromises = Array.from(files).map(async (file) => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/presignedUrl`, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });

            if (res.status !== 200) {
                console.error("Failed submission");
                return null;
            }

            const { data: presignedData } = res.data;
            
            if (!presignedData.signedUrl) {
                console.error("Failed to upload image");
                return null;
            }

            const { signedUrl, path } = presignedData;

            const uploadResponse = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadResponse.ok) {
                console.error("Failed to upload file to database");
                return null;
            }
            
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-bucket/${path}`;
            return publicUrl;
        });

        const uploadedImageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];
        
        onImageAdd(uploadedImageUrls);
        setIsUploading(false);
    }

    return (
        <label
            htmlFor="files"
            className={`w-40 h-40 border-2 border-dashed border-black cursor-pointer flex justify-center items-center rounded-md ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
            <input
            type="file"
            className="hidden"
            id="files"
            multiple
            onChange={handleImageUpload}
            disabled={isUploading}
            required
            />
            {isUploading ? (
                "Uploading..."
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-light">+</span>
                    <span className="mt-1">Upload Images</span>
                </div>
            )}
        </label>
    )
}