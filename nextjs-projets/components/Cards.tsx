type CardProps = {
  title: string;
  discription: string;
};

function Cards({ title, discription }: CardProps) {
  return (
    <div className="card w-fit p-4 rounded shadow-emerald-50 bg-gray-500">
      <h1>{title}</h1>
      <p>{discription}</p>
    </div>
  );
}

export default Cards;
