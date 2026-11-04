"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

export function LikeButton({
  propertyId,
  likeCount,
  initialLiked = false,
}: {
  propertyId: string;
  likeCount: number;
  initialLiked?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await fetch(`/api/properties/${propertyId}/like`, { method: "POST" });
          if (!res.ok) return;
          const data = await res.json();
          setLiked(data.liked);
          setCount(data.likeCount);
        });
      }}
    >
      <Heart size={16} className={liked ? "fill-navy" : ""} />
      {liked ? "Curtido" : "Curtir imóvel"} ({count})
    </Button>
  );
}
