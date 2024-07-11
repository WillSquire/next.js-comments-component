import { v4 as uuid } from "uuid";
import { Comments, IComment } from "@/components/Comment";

const mockResponse: IComment[] = [
  {
    id: uuid(),
    replies: [
      {
        id: uuid(),
        replies: [
          {
            id: uuid(),
            text: "Example nested nested comment.",
            timestamp: new Date("2024-07-11T22:15:01Z"),
            username: "Not you",
          },
        ],
        text: "Example nested comment.",
        timestamp: new Date("2024-07-11T22:15:01Z"),
        username: "Not you",
      },
    ],
    text: "Example comment.",
    timestamp: new Date("2024-07-11T22:15:01Z"),
    username: "Not you",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Comments comments={mockResponse} />
    </main>
  );
}
