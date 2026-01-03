import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CreateKnowledgeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateKnowledgeDialog({ open, onOpenChange }: CreateKnowledgeDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [repository, setRepository] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle knowledge item creation
    console.log({ title, description, content, category, repository, tags })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Knowledge Item</DialogTitle>
          <DialogDescription>Add a new knowledge item to your organizational repository</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief summary of the knowledge item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="bg-background min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="guidelines">Guidelines</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repository">Repository</Label>
              <Select value={repository} onValueChange={setRepository}>
                <SelectTrigger id="repository" className="bg-background">
                  <SelectValue placeholder="Select repository" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product-docs">Product Documentation</SelectItem>
                  <SelectItem value="best-practices">Best Practices</SelectItem>
                  <SelectItem value="client-resources">Client Resources</SelectItem>
                  <SelectItem value="training-materials">Training Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter the detailed content of your knowledge item"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="bg-background min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                className="bg-background"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Knowledge Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
