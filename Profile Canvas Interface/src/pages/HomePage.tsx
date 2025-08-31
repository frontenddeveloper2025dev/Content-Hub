import { Sparkles, User, ArrowRight, Users, Heart, MessageCircle, Plus, Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'

function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const features = [
    {
      icon: Users,
      title: "User Profiles",
      description: "Clean profile pages with banners, avatars, and content organization"
    },
    {
      icon: Heart,
      title: "Interactive Content",
      description: "Engage with posts through likes, comments, and collections"
    },
    {
      icon: MessageCircle,
      title: "Social Features",
      description: "Follow users, build collections, and discover new content"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-16">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Content Hub</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A clean, minimalist platform for sharing and discovering content. 
          Connect with others and organize your favorite content in beautiful collections.
        </p>
        
        {isAuthenticated ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
              <span className="text-sm">Welcome back, {user?.name}!</span>
              <Badge variant="outline">Authenticated</Badge>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/feed')}>
                <Rss className="w-4 h-4 mr-2" />
                Your Feed
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/explore')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Explore Posts
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/create-post')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/login')}>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
            <Button size="lg" variant="ghost" onClick={() => navigate('/explore')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Browse Content
            </Button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Content Preview */}
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-6">
          Join our community and start sharing your content with others.
        </p>
        {!isAuthenticated && (
          <Button size="lg" onClick={() => navigate('/login')}>
            Create Account
          </Button>
        )}
      </div>
    </div>
  )
}

export default HomePage 