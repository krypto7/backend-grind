const people = [
  { username: "mira.cole", note: "Writes about product and type." },
  { username: "jonas.lee", note: "Keeps a short public notebook." },
  { username: "ada.nwosu", note: "Ships small interface details." },
  { username: "leo.hart", note: "Collects quiet city photos." },
];

const topics = ["Design", "Notes", "Cities", "Work"];

export function ExploreScreen() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm font-medium text-primary">Explore</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Find people and notes</h1>

      <label className="mt-8 block">
        <span className="sr-only">Search</span>
        <input
          type="search"
          placeholder="Search usernames or topics"
          className="h-12 w-full rounded-2xl bg-card px-4 text-sm ring-1 ring-foreground/10 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground"
          >
            {topic}
          </span>
        ))}
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <li
            key={person.username}
            className="rounded-2xl bg-card px-5 py-4 ring-1 ring-foreground/10"
          >
            <p className="text-sm font-medium">@{person.username}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{person.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
