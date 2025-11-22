"use client";

import { WalrusDownload } from "@/clients/components/main/atoms/WalrusDownload";
import { WalrusUpload } from "@/clients/components/main/atoms/WalrusUpload";

export default function UploadTest() {
    return (
        <div className="mt-5">
            <WalrusUpload />
            <WalrusDownload />
        </div>
    )
}