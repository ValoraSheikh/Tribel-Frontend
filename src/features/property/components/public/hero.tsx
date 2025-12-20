import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <div className="bg-white">
      <div className="relative bg-gray-900">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <Image
            height={500}
            width={500}
            priority
            alt=""
            src="https://images.unsplash.com/photo-1596276020587-8044fe049813?q=80&w=939&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="size-full object-cover"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gray-900 opacity-50"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center sm:py-64 lg:px-0">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">
            Find your next stay in minutes
          </h1>
          <p className="mt-4 text-xl text-white">
            Search, compare, and book verified hostels and budget stays across cities.
            Fresh listings added daily so you always see the newest options.
          </p>
          <Link
            href="/search"
            className="mt-8 inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
          >
            Search Hostels
          </Link>
        </div>

      </div>
    </div>
  );
}
