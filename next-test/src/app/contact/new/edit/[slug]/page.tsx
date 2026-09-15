type BlogProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogPage({ params }: BlogProps) {
  console.log(params);
  const { slug } = await params;

  return (
    <div>
      <h1>Blog Slug: {slug}</h1>
    </div>
  );
}
