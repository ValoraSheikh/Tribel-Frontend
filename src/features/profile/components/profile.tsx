"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EditProfile } from "./edit-profile";
import { useProfile } from "../hooks/use-user";
import { UpdateAvatar } from "./update-avatar";

const Profile = () => {
  const { data: user, isLoading, error, isError } = useProfile();

  if (isLoading) {
    <h1>Loading...</h1>;
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <p>
          Failed to load profile. Please try again later.{" "}
          {error.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <UpdateAvatar
            userId={user.id}
            avatarUrl={user.avatar}
            firstName={user.firstName}
            lastName={user.lastName}
          />

          <div>
            <h1 className="text-2xl font-semibold">
              {user.firstName} {user.lastName}
            </h1>
            <Badge className="mt-1 capitalize">{user.role}</Badge>
          </div>

          <div className="ml-auto">
            {/* modal approach */}
            <div
              aria-label="Edit profile"
              className="p-2 hover:rounded hover:bg-muted"
            >
              <EditProfile user={user} />
            </div>
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
