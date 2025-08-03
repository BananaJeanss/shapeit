import { signIn } from "@/auth";

export default function Home() {
  return (
    <div>
      <header className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold pb-8">shapeit</h1>
        <p className="text-lg">a social media where you react with shapes</p>
        <div className="flex flex-row items-center gap-4 pt-8">
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button className="border border-gray bg-white text-black rounded-4xl py-2 px-12 hover:cursor-pointer">
              Log In
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}
