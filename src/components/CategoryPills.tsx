import { Badge } from "@/components/ui/badge";
import { useBusinessCategories } from "@/hooks/useBusinessCategories";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryPillsProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoryPills = ({ selectedCategory, onCategorySelect }: CategoryPillsProps) => {
  const { data: categories, isLoading } = useBusinessCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer px-4 py-2 hover:bg-primary/10 transition-colors flex-shrink-0"
          onClick={() => onCategorySelect("all")}
        >
          All Categories
        </Badge>
        {categories?.map((category) => {
          const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Tag;
          return (
            <Badge
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 hover:bg-primary/10 transition-colors flex gap-2 items-center flex-shrink-0"
              onClick={() => onCategorySelect(category.name)}
            >
              <IconComponent className="w-4 h-4" />
              {category.name}
            </Badge>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryPills;