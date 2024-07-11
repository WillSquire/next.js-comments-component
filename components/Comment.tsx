"use client";

import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuid } from "uuid";

export interface IComment {
  id: string;
  replies?: IComment[];
  text: string;
  timestamp: Date;
  username: string;
}

type CommentProps = IComment & {
  expanded?: boolean;
  onExpand: (commentId: string, expanded: boolean) => void;
  onReply: (commentId: string, reply: string) => void;
};

/**
 * Single comment component to repeat.
 */
const Comment = ({
  id,
  expanded,
  onExpand,
  onReply,
  replies,
  text,
  timestamp,
  username,
}: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);

  const toggleExpanded = useCallback(() => {
    onExpand(id, !expanded);
  }, [expanded, id, onExpand]);

  const toggleReplying = useCallback(() => {
    setIsReplying((isReplying) => !isReplying);
  }, []);

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      const text: string | undefined = e.currentTarget.text?.value;

      if (text !== undefined) {
        onReply(id, text);
      }

      setIsReplying(false);
    },
    [id, onReply]
  );

  const dateTimeText = useMemo(
    () =>
      timestamp.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
    [timestamp]
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-3">
        <span>{username}</span>
        <span>{dateTimeText}</span>
        {(replies?.length ?? 0) > 0 && (
          <button className="underline" onClick={toggleExpanded}>
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      <div>
        <span>{text}</span>
      </div>
      <form className="flex gap-3" onSubmit={onSubmit}>
        {isReplying && (
          <>
            <input className="border rounded" name="text" />
            <button className="underline" type="submit">
              Add comment
            </button>
          </>
        )}
        <button className="underline" onClick={toggleReplying} type="button">
          {isReplying ? "Cancel" : "Reply"}
        </button>
      </form>
      <div className="pl-5">
        {expanded &&
          replies?.map((reply) => (
            <Comment
              key={reply.id}
              onExpand={onExpand}
              onReply={onReply}
              {...reply}
            />
          ))}
      </div>
    </div>
  );
};

export interface CommentsProps {
  comments: IComment[];
}

/**
 * Multi-comment component.
 */
export const Comments = ({ comments }: CommentsProps) => {
  const [localComments, setLocalComments] = useState(comments);
  const [search, setSearch] = useState("");

  const onSearch: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setSearch(e.currentTarget.value);
  }, []);

  const onExpand = useCallback((commentId: string, expanded: boolean) => {
    setLocalComments((localComments) =>
      expandComment(commentId, expanded, localComments)
    );
  }, []);

  const onReply = useCallback((commentId: string, reply: string) => {
    setLocalComments((localComments) =>
      addComment(commentId, reply, localComments)
    );
  }, []);

  /**
   * Update with fresh on change.
   */
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  /**
   * In a real application, this would be debounced.
   */
  const commentsSearch = useMemo(
    () =>
      search.length !== 0
        ? searchComments(search, localComments)
        : localComments,
    [localComments, search]
  );

  return (
    <section className="w-full flex flex-col gap-5">
      <input
        className="border rounded"
        onChange={onSearch}
        name="search"
        placeholder="Search..."
        value={search}
      />
      <div>
        {commentsSearch.map((comment) => (
          <Comment
            key={comment.id}
            onExpand={onExpand}
            onReply={onReply}
            {...comment}
          />
        ))}
      </div>
    </section>
  );
};

/**
 * Recursively searches the `comments` array for
 * the `commentId` to add the `reply` as one of it's
 * `replies` and mark as `expanded` to show replies.
 *
 * In a real application, this would send a network
 * request here or trigger one elsewhere to update
 * on the server/s and stop at a given depth.
 */
const addComment = (
  commentId: string,
  reply: string,
  comments: IComment[]
): IComment[] =>
  comments.reduce<IComment[]>(
    (prev, current) => [
      ...prev,
      {
        ...current,
        ...(current.id === commentId ? { expanded: true } : {}),
        replies:
          current.id === commentId
            ? [
                ...(current?.replies ?? []),
                {
                  id: uuid(),
                  text: reply,
                  timestamp: new Date(),
                  username: "You",
                },
              ]
            : addComment(commentId, reply, current.replies ?? []),
      },
    ],
    []
  );

/**
 * Recursively searches the `comments` array for
 * the `commentId` to update `expanded` to show replies.
 */
const expandComment = (
  commentId: string,
  expanded: boolean,
  comments: IComment[]
): IComment[] =>
  comments.reduce<IComment[]>(
    (prev, current) => [
      ...prev,
      {
        ...current,
        ...(current.id === commentId ? { expanded } : {}),
        replies: expandComment(commentId, expanded, current.replies ?? []),
      },
    ],
    []
  );

/**
 * Recursively filters the `comments` array for
 * for text containing substring.
 *
 * In a real application, this would be a network
 * request to search on the server/s and stop at
 * a given depth.
 */
const searchComments = (search: string, comments: IComment[]): IComment[] =>
  comments.filter(
    (comment) =>
      comment.text.toLowerCase().includes(search.toLowerCase()) ||
      searchComments(search, comment.replies ?? []).length > 0
  );
