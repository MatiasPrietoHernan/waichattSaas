"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface ProductFiltersProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
}: ProductFiltersProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className={
              selectedCategory === category
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
            }
          >
            {category === "all" ? "Todos" : category}
          </Button>
        ))}
      </div>
    </div>
  )
}
