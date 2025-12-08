"use client";
import { Button } from "@/components/ui/button";
import { decrement, increment } from "@/features/counter/counterSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <>
      <div className="flex justify-around mt-2 bg-gray-950 h-[50vh]">
        <Image
          src="./logo.svg"
          alt="Tribel"
          height={50}
          width={50}
          loading="eager"
          priority
        />
        <h1 className="text-5xl text-stone-400 font-extrabold">
          Welcome to Zappotel, Sphinx of black quartz, judge my vow.
        </h1>
        <h1 className="text-white">Here is the count {count}</h1>
        <Button variant="outline" onClick={() => dispatch(increment())}>
          Click here to add
        </Button>
        <Button variant="outline" onClick={() => dispatch(decrement())}>
          Click here to reduce
        </Button>
      </div>

      <div className="flex justify-around">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>

        <Link href="/private">
          <Button variant="secondary">Private</Button>
        </Link>
        
        
        <Link href="/profile">
          <Button variant="link">Profile</Button>
        </Link>

        <Link href="/logout">
          <Button variant="destructive">Logout</Button>
        </Link>
      </div>

      <div className="flex justify-around">
        <h1 className="font-mono text-3xl ">
          Sphinx of black quartz, judge my vow.
        </h1>

        <h1 className="font-sans text-3xl">
          Sphinx of black quartz, judge my vow.
        </h1>

        <h1 className="font-serif text-muted-foreground text-3xl">
          Sphinx of black quartz, judge my vow.
        </h1>
      </div>
      
      <div className="flex justify-around">
      <h1>Card</h1>
      </div>
    </>
  );
}
