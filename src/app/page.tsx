import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { Github } from "lucide-react";
import * as shapes from "../components/shapes";

export default async function Home() {
  const session = await auth();

  if (session && session.user) {
    redirect("/feed");
  }

  return (
    <div>
      <header className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-row mb-4">
          <shapes.Triangle />
          <shapes.Circle />
          <shapes.Square />
          <shapes.Diamond />
          <shapes.Hexagon />
        </div>
        <h1 className="text-4xl font-bold pb-8">shapeit</h1>
        <p className="text-lg">a social media where you react with shapes</p>
        <div className="flex flex-row items-center gap-4 pt-8">
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button className="border border-gray-300 bg-white text-black rounded-4xl py-2 px-12 hover:cursor-pointer">
              <Github className="inline mr-2" />
              Log In with GitHub
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}
