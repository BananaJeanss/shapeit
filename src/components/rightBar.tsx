import React from "react";
import Image from "next/image";
import { LogOut, Settings, User } from "lucide-react";
import { signOutAction } from "@/src/actions/auth";

export const RightBar = ({
  session,
}: {
  session: { user: { name?: string; image?: string } };
}) => (
  <div className="flex flex-col items-center justify-center flex-1 h-full gap-8">
    <div className="border border-gray-300 p-4 rounded-2xl flex flex-row items-center justify-center gap-4">
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
      <div className="hover:cursor-pointer flex items-center text-lg ">
        <User className="inline mr-2" />
        Profile
      </div>
      <div className="hover:cursor-pointer flex items-center text-lg ">
        <Settings className="inline mr-2" />
        Settings
      </div>
    </div>
    <form action={signOutAction}>
      <button className="border border-gray-300 bg-white text-black rounded-4xl py-2 px-12 hover:cursor-pointer">
        <LogOut className="inline mr-2" />
        Log Out
      </button>
    </form>
  </div>
);
