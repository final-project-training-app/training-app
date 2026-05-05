type SessionImageProps = {
  title: string;
  imageUrl: string;
};

export function SessionImage({ title, imageUrl }: SessionImageProps) {
  return (
    <img
      src={imageUrl}
      alt={title}
      className="w-full rounded-4xl object-cover shadow-sm"
    />
  );
}
