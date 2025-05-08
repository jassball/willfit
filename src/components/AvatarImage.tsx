"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getAvatarSignedUrl } from "@/lib/getAvatarUrl";

type AvatarImageProps = {
  avatarPath?: string | null;
  size?: number;
};

export function AvatarImage({ avatarPath, size = 8 }: AvatarImageProps) {
  const [url, setUrl] = useState("/avatar-modified.ico");

  useEffect(() => {
    let isMounted = true;
    getAvatarSignedUrl(avatarPath).then((signedUrl) => {
      if (isMounted) setUrl(signedUrl);
    });
    return () => {
      isMounted = false;
    };
  }, [avatarPath]);

  return (
    <Image
      src={url}
      alt="Avatar"
      width={32}
      height={32}
      className={`w-${size} h-${size} rounded-full object-cover`}
    />
  );
}
