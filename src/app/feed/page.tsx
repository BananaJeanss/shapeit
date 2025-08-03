import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { LogOut, User, Settings } from "lucide-react";
import Image from "next/image";
import * as shapes from "@/src/components/shapes";

export default async function Feed() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return (
    <div className="flex flex-row items-center justify-center w-screen h-screen overflow-hidden">
      <div className="flex flex-col items-center justify-center border-r border-gray-300 flex-1 h-full">
        <shapes.Triangle />
        <shapes.Circle />
        <shapes.Square />
        <shapes.Diamond />
        <shapes.Hexagon />
        <p>shapeit</p>
      </div>
      <div className="flex flex-col border-r border-gray-300 flex-1 h-full">
        <h2 className="text-4xl font-semibold m-4">Feed</h2>
        <hr style={{ width: "90%", margin: "0 auto" }} />
      </div>
      <div className="flex flex-col items-center justify-center flex-1 h-full gap-8">
        <div className="border border-gray-300 p-4 rounded-2xl  flex flex-row items-center justify-center gap-4">
          <h3 className="text-2xl font-semibold mb-0 self-center">
            @{session.user.name || "Anonymous User"}
          </h3>
          <Image
            src={session.user.image || ""}
            alt="User Image"
            width={100}
            height={100}
            className="rounded-full self-center"
          />
        </div>
        <div className="flex flex-col p-8 gap-4">
          {/* todo: make this modular or whatever the point of react is */}
          <div className="hover:cursor-pointer flex items-center text-lg ">
            <User className="inline mr-2" />
            Profile
          </div>
          <div className="hover:cursor-pointer flex items-center text-lg ">
            <Settings className="inline mr-2" />
            Settings
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="border border-gray-300 bg-white text-black rounded-4xl py-2 px-12 hover:cursor-pointer">
            <LogOut className="inline mr-2" />
            Log Out
          </button>
        </form>
      </div>
    </div>
  );
}
