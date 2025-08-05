import { auth } from "@/auth";
import { signOutAction } from "@/src/actions/auth";
import { LeftBar } from "@/src/components/leftBar";
import { RightBar } from "@/src/components/rightBar";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import Image from "next/image";
import DeleteAccountButton from "./DeleteAccountButton";

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return (
    <div className="flex flex-row w-screen h-screen overflow-hidden">
      <div className="w-1/3 flex-shrink-0">
        <LeftBar />
      </div>
      <div className="flex flex-col border-r border-gray-300 w-1/3 flex-shrink-0 h-full">
        <h2 className="text-4xl font-semibold mx-8 my-4">Settings</h2>
        <hr className="w-[90%] mx-auto mb-4" />
        <div className="flex flex-col items-center justify-center h-full">
          <h3 className="flex flex-row items-center gap-2 text-2xl font-semibold mb-4">
            <Image
              src={session.user.image || ""}
              alt="User Image"
              width={64}
              height={64}
              className="rounded-full mr-2 w-16 h-16"
            />
            @{session.user.githubUsername || "Anonymous User"}
          </h3>
          <button
            onClick={signOutAction}
            className="flex items-center border border-gray-300 text-white py-2 px-4 rounded-4xl cursor-pointer hover:bg-gray-100 hover:text-black transition-colors mb-4"
          >
            <LogOut className="inline mr-2" />
            Log Out
          </button>
          <DeleteAccountButton />
        </div>
      </div>
      <div className="w-1/3 flex-shrink-0">
        <RightBar
          session={{
            user: {
              name: session.user?.name ?? undefined,
              image: session.user?.image ?? undefined,
              githubUsername: session.user?.githubUsername ?? undefined,
            },
          }}
        />
      </div>
    </div>
  );
}
