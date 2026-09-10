import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

function AvatarImg({
  avatar,
  onClick,
}: {
  avatar: string;
  onClick?: () => void;
}) {
  return (
    <div>
      <Link href="/profile" onClick={onClick}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} />
        </Avatar>
      </Link>
    </div>
  );
}

export default AvatarImg;
