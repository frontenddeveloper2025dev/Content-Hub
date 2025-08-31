import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Hash,
  User,
  Heart,
  Eye,
  MessageCircle,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export interface SearchFilters {
  query: string;
  category: string;
  tags: string[];
  author: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'recent' | 'popular' | 'views' | 'comments';
  minLikes: number;
  onlyFeatured: boolean;
  status: 'all' | 'published' | 'draft';
}

interface PostSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  placeholder?: string;
  showAdvanced?: boolean;
}

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'photography', label: 'Photography' },
  { id: 'art', label: 'Art' },
  { id: 'design', label: 'Design' },
  { id: 'tech', label: 'Tech' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'travel', label: 'Travel' },
  { id: 'food', label: 'Food' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'music', label: 'Music' },
  { id: 'sports', label: 'Sports' },
  { id: 'other', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent', icon: Calendar },
  { value: 'popular', label: 'Most Liked', icon: Heart },
  { value: 'views', label: 'Most Viewed', icon: Eye },
  { value: 'comments', label: 'Most Discussed', icon: MessageCircle },
];

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

export default function PostSearch({ 
  onFiltersChange, 
  initialFilters = {},
  placeholder = "Search posts, users, or tags...",
  showAdvanced = true
}: PostSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    tags: [],
    author: '',
    dateRange: 'all',
    sortBy: 'recent',
    minLikes: 0,
    onlyFeatured: false,
    status: 'published',
    ...initialFilters,
  });

  const [tagInput, setTagInput] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Debounced search
  const [searchQuery, setSearchQuery] = useState(filters.query);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.query) {
        updateFilters({ query: searchQuery });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, filters.query]);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const addTag = useCallback((tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (cleanTag && !filters.tags.includes(cleanTag)) {
      updateFilters({ tags: [...filters.tags, cleanTag] });
    }
    setTagInput('');
  }, [filters.tags, updateFilters]);

  const removeTag = useCallback((tagToRemove: string) => {
    updateFilters({ tags: filters.tags.filter(tag => tag !== tagToRemove) });
  }, [filters.tags, updateFilters]);

  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: '',
      tags: [],
      author: '',
      dateRange: 'all',
      sortBy: 'recent',
      minLikes: 0,
      onlyFeatured: false,
      status: 'published',
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const hasActiveFilters = filters.query || filters.category || filters.tags.length > 0 || 
    filters.author || filters.dateRange !== 'all' || filters.sortBy !== 'recent' || 
    filters.minLikes > 0 || filters.onlyFeatured || filters.status !== 'published';

  const activeFilterCount = [
    filters.query,
    filters.category,
    filters.tags.length > 0,
    filters.author,
    filters.dateRange !== 'all',
    filters.sortBy !== 'recent',
    filters.minLikes > 0,
    filters.onlyFeatured,
    filters.status !== 'published'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 h-12 text-base"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              updateFilters({ query: '' });
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Category Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Hash className="h-3 w-3 mr-1" />
              {filters.category ? 
                CATEGORIES.find(c => c.id === filters.category)?.label : 
                'Category'
              }
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={filters.category === category.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => updateFilters({ category: category.id })}
                  className="w-full justify-start h-8"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {React.createElement(SORT_OPTIONS.find(s => s.value === filters.sortBy)?.icon || Calendar, 
                { className: "h-3 w-3 mr-1" }
              )}
              {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.sortBy === option.value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => updateFilters({ sortBy: option.value as any })}
                  className="w-full justify-start h-8"
                >
                  <option.icon className="h-3 w-3 mr-2" />
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Calendar className="h-3 w-3 mr-1" />
              {DATE_RANGES.find(d => d.value === filters.dateRange)?.label}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {DATE_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant={filters.dateRange === range.value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => updateFilters({ dateRange: range.value as any })}
                  className="w-full justify-start h-8"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Advanced Filters Toggle */}
        {showAdvanced && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="h-8"
          >
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            Advanced
            {activeFilterCount > 3 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                {activeFilterCount - 3}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Tags */}
      {filters.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTag(tag)}
                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {isAdvancedOpen && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Filters</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdvancedOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Tag Input */}
            <div className="space-y-2">
              <Label htmlFor="tag-input">Tags</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="tag-input"
                    placeholder="Add tags (e.g., nature, portrait)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim()}
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Author Filter */}
            <div className="space-y-2">
              <Label htmlFor="author-input">Author</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="author-input"
                  placeholder="Search by username..."
                  value={filters.author}
                  onChange={(e) => updateFilters({ author: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Minimum Likes */}
            <div className="space-y-2">
              <Label htmlFor="min-likes">Minimum Likes: {filters.minLikes}</Label>
              <Input
                id="min-likes"
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.minLikes}
                onChange={(e) => updateFilters({ minLikes: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Featured Only Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="featured-only">Featured posts only</Label>
              <Switch
                id="featured-only"
                checked={filters.onlyFeatured}
                onCheckedChange={(checked) => updateFilters({ onlyFeatured: checked })}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Post Status</Label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Drafts' },
                ].map((status) => (
                  <Button
                    key={status.value}
                    variant={filters.status === status.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilters({ status: status.value as any })}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}