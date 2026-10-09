import Cards from "@/components/Cards";

export default function Home() {
  return (
    <div className="flex flex-col gap-1.5 flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Cards title="This is Krishna" discription="Krishan is bansi bajaiya" />

      <Cards title="This is Nishant" discription="Krishan is bansi bajaiya" />
    </div>
  );
}
