"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Camera } from "lucide-react";
export function UserProfileSection() {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
   if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  const handleSave = async () => {
    if (user) {
    try {
        if (selectedImage) {
          await user.setProfileImage({ file: selectedImage });
        }
        await user.update({
          firstName,
          lastName,
        });
        setIsEditing(false);
        setSelectedImage(null);
        setPreviewUrl(null);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Manage your personal information and account details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
          <div className="relative">
            <img
             src={previewUrl || user?.imageUrl}
              alt="Profile"
              className="h-16 w-16 rounded-full object-cover border"
            />
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Camera className="h-3 w-3" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.fullName}</p>
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Click the camera icon to upload a new photo
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditing}
              aria-label="First name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditing}
              aria-label="Last name"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            value={user?.primaryEmailAddress?.emailAddress || ""}
            disabled
            aria-label="Email address"
          />
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} aria-label="Save profile changes">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFirstName(user?.firstName || "");
                  setLastName(user?.lastName || "");
                  setIsEditing(false);
                  setSelectedImage(null);
                  setPreviewUrl(null);
                }}
                aria-label="Cancel editing"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              aria-label="Edit profile"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
