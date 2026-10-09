import React from "react";

type ProfilePageProps = {
  params: Promise<{ name: string }>;
};

async function ProfilePage({ params }: ProfilePageProps) {
  const users = [
    {
      id: 1,
      name: "nishant",
      email: "nishnt@yopmail.com",
      bio: "Hello this is my bio",
    },
  ];

  const pageParams = await params;

  const username = pageParams.name;

  console.log("======", username);

  return (
    <div>
      <h1>Rohan&aposs Profile page</h1>
      <p>
        Welcome to Rohan&aposs profile! Herer you can find information about
        rohan
      </p>
    </div>
  );
}

export default ProfilePage;
