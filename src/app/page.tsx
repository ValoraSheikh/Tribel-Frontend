import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex justify-around mt-2">
        <Image src="./logo.svg" alt="Tribel" height={50} width={50} />
        <h1 className="text-5xl text-stone-400 font-extrabold">
          Welcome to Zappotel
        </h1>
      </div>
      <Button variant="outline">Click here </Button>
    </>
  );
}
