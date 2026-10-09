"use client";

import { useState } from "react";

type User = {
  id: number;
  name: string;
  username: string;
};

type FilterUsersProps = {
  users: User[];
};

const FilterUsers = ({ users }: FilterUsersProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul>
        {filteredUsers.map((user) => (
          <li key={user.id}>
            <p>{user.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilterUsers;
