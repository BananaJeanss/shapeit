import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import * as shapes from "@/src/components/shapes";
import { RightBar } from "@/src/components/rightBar";
import { LeftBar } from "@/src/components/leftBar";

export default async function Feed() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return (
    <div className="flex flex-row items-center justify-center w-screen h-screen overflow-hidden">
        <LeftBar />
      <div className="flex flex-col border-r border-gray-300 flex-1 h-full">
        <h2 className="text-4xl font-semibold m-4">Feed</h2>
        <hr style={{ width: "90%", margin: "0 auto" }} />
      </div>
      <RightBar session={{ user: { 
        name: session.user?.name ?? undefined, 
        image: session.user?.image ?? undefined
      } }} />
    </div>
  );
}
