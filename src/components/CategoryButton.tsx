import Link from "next/link";
import type { AppCategory } from "@/lib/apps";

type CategoryButtonProps = {
  category: AppCategory;
  label: string;
  description: string;
};

export function CategoryButton({ category, label, description }: CategoryButtonProps) {
  return (
    <Link href={`/category/${category}`} className="categoryButton">
      <span>{label}</span>
      <small>{description}</small>
    </Link>
  );
}
