"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EditProfile } from "./edit-profile";
import { useProfile } from "../hooks/use-user";

const Profile = () => {
  const { data: user, isLoading, error } = useProfile();

  if (isLoading) {
    <h1>Loading...</h1>;
  }

  if (error) {
    console.log(error);
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-semibold">
              {user.firstName} {user.lastName}
            </h1>
            <Badge className="mt-1 capitalize">{user.role}</Badge>
          </div>

          <div className="ml-auto">
            {/* modal approach */}
            <button
              aria-label="Edit profile"
              className="p-2 hover:rounded hover:bg-muted"
            >
              <EditProfile />
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Profile Information</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Phone Number</p>
            <p>{user.phoneNo || "Not Provided"}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Created At</p>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
