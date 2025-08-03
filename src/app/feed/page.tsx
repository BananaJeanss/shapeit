import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth"

export default async function Feed() {
    const session = await auth()

  if (!session || !session.user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Feed</h1>
      <div className="flex flex-col items-center bg-white rounded-lg shadow p-6">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={80}
            height={80}
            className="rounded-full mb-2"
          />
        )}
        <span className="text-xl text-black font-semibold">{session.user.name || "No name"}</span>
        <span className="text-gray-500">{session.user.email || "No email"}</span>
      </div>
    </div>
  );
}