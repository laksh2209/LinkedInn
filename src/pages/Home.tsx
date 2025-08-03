import Navbar from "@/components/Navbar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Post } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const mockPosts = [
  {
    author: {
      name: "Sarah Johnson",
      title: "Senior Software Engineer at TechCorp",
      initials: "SJ"
    },
    content: "Just shipped a new feature that reduces page load time by 40%! Excited to see the impact on user experience. The key was implementing lazy loading and optimizing our bundle size. #webdev #performance",
    timestamp: "2h",
    likes: 42,
    comments: 8,
    reposts: 5
  },
  {
    author: {
      name: "Michael Chen",
      title: "Product Manager at InnovateCo",
      initials: "MC"
    },
    content: "Reflecting on an amazing quarter! Our team launched 3 major features and increased user engagement by 25%. Couldn't have done it without this incredible team. What's your biggest win this quarter?",
    timestamp: "4h",
    likes: 67,
    comments: 15,
    reposts: 12
  },
  {
    author: {
      name: "Emily Rodriguez",
      title: "UX Designer at DesignStudio",
      initials: "ER"
    },
    content: "Design tip: Always test your prototypes with real users before finalizing. What seems intuitive to us might not be intuitive to our users. User research is invaluable! 🎨",
    timestamp: "6h",
    likes: 34,
    comments: 6,
    reposts: 8
  },
  {
    author: {
      name: "David Thompson",
      title: "Startup Founder | AI Enthusiast",
      initials: "DT"
    },
    content: "Bootstrapping a startup teaches you to be resourceful. Every dollar counts, every decision matters. But the journey is incredibly rewarding when you see your vision come to life! 🚀",
    timestamp: "8h",
    likes: 89,
    comments: 23,
    reposts: 18
  }
];

const Home = () => {
  const { user } = useAuth();
  
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => apiService.getPosts(),
  });

  const posts = postsData?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-foreground">{user?.fullName || "User"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{user?.title || "Professional"}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile viewers</span>
                      <span className="text-primary font-medium">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Post impressions</span>
                      <span className="text-primary font-medium">1,248</span>
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="text-left space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Recent</p>
                    <div className="space-y-1">
                      <p className="text-sm hover:text-primary cursor-pointer"># JavaScript</p>
                      <p className="text-sm hover:text-primary cursor-pointer"># React</p>
                      <p className="text-sm hover:text-primary cursor-pointer"># WebDevelopment</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="col-span-6">
            <CreatePost />
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Error loading posts. Please try again.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post: Post) => (
                  <PostCard key={post._id} {...post} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">LinkedIn News</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm hover:text-primary cursor-pointer">
                      Tech hiring rebounds strongly
                    </h4>
                    <p className="text-xs text-muted-foreground">2h ago • 1,234 readers</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm hover:text-primary cursor-pointer">
                      Remote work trends in 2024
                    </h4>
                    <p className="text-xs text-muted-foreground">4h ago • 856 readers</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm hover:text-primary cursor-pointer">
                      AI tools reshape workflows
                    </h4>
                    <p className="text-xs text-muted-foreground">6h ago • 2,341 readers</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm hover:text-primary cursor-pointer">
                      Startup funding landscape
                    </h4>
                    <p className="text-xs text-muted-foreground">8h ago • 567 readers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">People you may know</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Alex Kim", title: "Product Designer", initials: "AK" },
                    { name: "Lisa Wang", title: "Data Scientist", initials: "LW" },
                    { name: "James Miller", title: "DevOps Engineer", initials: "JM" }
                  ].map((person, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm">{person.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{person.name}</p>
                          <p className="text-xs text-muted-foreground">{person.title}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;