import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { userPostService, userProfileService } from '@/lib/database';
import { upload } from '@devvai/devv-code-backend';
import { 
  Camera, 
  X, 
  ImagePlus, 
  Loader2, 
  Hash, 
  Eye,
  FileImage,
  Save,
  Send,
  ArrowLeft
} from 'lucide-react';

const POST_CATEGORIES = [
  { value: 'photography', label: 'Photography' },
  { value: 'art', label: 'Art & Design' },
  { value: 'nature', label: 'Nature' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food' },
  { value: 'tech', label: 'Technology' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'other', label: 'Other' },
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Handle file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isImage) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isUnderLimit) {
        toast({
          title: "File too large",
          description: "Please select images under 10MB.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (images.length + validFiles.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload up to 5 images per post.",
        variant: "destructive",
      });
      return;
    }

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images
  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of images) {
        const response = await upload.uploadFile(image);
        
        if (upload.isErrorResponse(response)) {
          throw new Error(response.errMsg);
        }
        
        if (response.link) {
          uploadedUrls.push(response.link);
        }
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  // Add tag
  const addTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setCurrentTag('');
    } else if (formData.tags.length >= 10) {
      toast({
        title: "Too many tags",
        description: "You can add up to 10 tags per post.",
        variant: "destructive",
      });
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create posts.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a category for your post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages();
      
      // Get user profile for username
      const userProfile = await userProfileService.getProfile(user.uid);
      const username = userProfile?.username || user.name || 'User';

      // Create post
      await userPostService.createPost(
        {
          title: formData.title.trim(),
          content: formData.content.trim() || undefined,
          image_url: uploadedImageUrls[0] || undefined, // Main image
          images: uploadedImageUrls.length > 1 ? uploadedImageUrls : undefined,
          category: formData.category,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          status,
        },
        user.uid,
        username
      );

      // Update user's post count if published
      if (status === 'published' && userProfile) {
        await userProfileService.incrementPostsCount(user.uid, userProfile._id);
      }

      toast({
        title: status === 'published' ? "Post published!" : "Draft saved!",
        description: status === 'published' 
          ? "Your post has been published successfully." 
          : "Your draft has been saved successfully.",
      });

      // Navigate to profile page
      navigate('/profile');

    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: "Failed to create post",
        description: "An error occurred while creating your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up preview URLs on unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Post</h1>
            <p className="text-slate-600 mt-1">Share your content with the community</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Post Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter an engaging title..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                    maxLength={100}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="content">Description</Label>
                  <Textarea
                    id="content"
                    placeholder="Tell us more about your post..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="mt-1 min-h-[120px]"
                    maxLength={2000}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.content.length}/2000 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5" />
                  Images ({images.length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={images.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Camera className="h-8 w-8 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {images.length >= 5 ? 'Maximum images reached' : 'Click to upload images'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 text-xs">
                            Main Image
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {uploadingImages && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Uploading images, please wait...
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Tags ({formData.tags.length}/10)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1"
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!currentTag.trim() || formData.tags.length >= 10}
                  >
                    Add
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreviews[0] && (
                  <img
                    src={imagePreviews[0]}
                    alt="Post preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2">
                    {formData.title || 'Untitled Post'}
                  </h3>
                  {formData.content && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                      {formData.content}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>By {user?.name || 'You'}</span>
                  {formData.category && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{formData.category}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={isSubmitting || uploadingImages}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Publish Post
                </Button>
                
                <Button
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting || uploadingImages}
                  variant="outline"
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save as Draft
                </Button>

                <Separator />
                
                <div className="text-xs text-slate-500 space-y-1">
                  <p>• Drafts are only visible to you</p>
                  <p>• Published posts are visible to everyone</p>
                  <p>• You can edit posts after publishing</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}