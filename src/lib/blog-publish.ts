/** Resolve effective public status (scheduled posts become published after date). */
export function isPublicBlogStatus(status: string, scheduledAt?: Date | null, now = new Date()) {
  if (status === "publicado") return true;
  if (status === "agendado" && scheduledAt && scheduledAt.getTime() <= now.getTime()) return true;
  return false;
}

export function publicBlogWhere(now = new Date()) {
  return {
    OR: [
      { status: "publicado" },
      { status: "agendado", scheduledAt: { lte: now } },
    ],
  };
}
