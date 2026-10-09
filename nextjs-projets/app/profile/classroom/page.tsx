import FilterUsers from "@/components/FilterUsers";

type User = {
  id: number;
  name: string;
  username: string;
};

export default async function Classroom() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const users: User[] = await response.json();

  return (
    <div>
      <h1>This is classroom</h1>

      {users.length > 0 ? (
        <FilterUsers users={users} />
      ) : (
        <h1>No users found</h1>
      )}
    </div>
  );
}
