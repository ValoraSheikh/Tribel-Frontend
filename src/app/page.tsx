"use client";
import { Button } from "@/components/ui/button";
import { decrement, increment } from "@/features/counter/counterSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import Image from "next/image";

export default function Page() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <>
      <div className="flex justify-around mt-2 bg-gray-950 h-screen">
        <Image
          src="./logo.svg"
          alt="Tribel"
          height={50}
          width={50}
          loading="eager"
        />
        <h1 className="text-5xl text-stone-400 font-extrabold">
          Welcome to Zappotel
        </h1>
        <h1 className="text-white">Here is the count {count}</h1>
        <Button variant="outline" onClick={() => dispatch(increment())}>
          Click here to add
        </Button>
        <Button variant="outline" onClick={() => dispatch(decrement())}>
          Click here to reduce
        </Button>
      </div>

    </>
  );
}
