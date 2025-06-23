import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { WishlistItem } from "./types"

interface WishlistItemProps {
  item: WishlistItem
}

export function WishlistItem({ item }: WishlistItemProps) {
  const getStatusBadge = (item: WishlistItem) => {
    switch (item.status) {
      case "available":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Available</Badge>
      case "reserved":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
            Reserved
          </Badge>
        )
      case "purchased":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">✓ Purchased</Badge>
      default:
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Available</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>
      case "HIGH":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">High</Badge>
      case "MEDIUM":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Medium</Badge>
      case "LOW":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Medium</Badge>
    }
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {item.title}
          </CardTitle>
          {getStatusBadge(item)}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {item.category.name}
          </Badge>
          {getPriorityBadge(item.priority)}
        </div>
        {item.description && (
          <CardDescription className="text-slate-600 line-clamp-3 leading-relaxed">
            {item.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-bold text-emerald-600">${item.price?.toFixed(2) || '0.00'}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-slate-300 hover:bg-slate-50"
          >
            <a href={item.productUrl || ''} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Item
            </a>
          </Button>
        </div>

        <div className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
          Added{" "}
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </CardContent>
    </Card>
  )
} 