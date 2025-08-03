import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, ExternalLink, Edit } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Post } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ProfileEditModal from "@/components/ProfileEditModal";

const userPosts = [
  {
    author: {
      name: "John Doe",
      title: "Software Engineer at TechCorp",
      initials: "JD"
    },
    content: "Excited to share that I've completed my certification in Cloud Architecture! Looking forward to implementing these new skills in upcoming projects. Always learning, always growing! 🚀",
    timestamp: "1d",
    likes: 28,
    comments: 5,
    reposts: 3
  },
  {
    author: {
      name: "John Doe",
      title: "Software Engineer at TechCorp",
      initials: "JD"
    },
    content: "Working on a new React component library for our team. The goal is to create reusable, accessible components that speed up development. Open source release coming soon!",
    timestamp: "3d",
    likes: 45,
    comments: 12,
    reposts: 8
  },
  {
    author: {
      name: "John Doe",
      title: "Software Engineer at TechCorp",
      initials: "JD"
    },
    content: "Attended an amazing tech conference today. Key takeaway: The future is about building sustainable, scalable solutions that prioritize user experience. Inspired by all the innovation happening in our field!",
    timestamp: "1w",
    likes: 67,
    comments: 18,
    reposts: 15
  }
];

const Profile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAuth();

  // Fetch user's posts
  const { data: userPostsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', user?._id],
    queryFn: () => apiService.getUserPosts(user?._id || ''),
    enabled: !!user?._id,
  });

  const userPosts = userPostsData?.data || [];

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-primary to-primary-hover rounded-t-lg"></div>
            
            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-6">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                <AvatarFallback className="text-3xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <CardContent className="pt-20 pb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{user?.fullName || "User"}</h1>
                  <Badge variant="secondary" className="text-xs">
                    Professional
                  </Badge>
                </div>
                
                <p className="text-xl text-muted-foreground mb-3">
                  {user?.title || "Professional"} {user?.company ? `at ${user.company}` : ""}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  {user?.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Member
                  </div>
                </div>
                
                {user?.bio && (
                  <p className="text-foreground leading-relaxed mb-4 max-w-2xl">
                    {user.bio}
                  </p>
                )}
                
                {user?.skills && user.skills.length > 0 && (
                  <div className="flex items-center space-x-3">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button onClick={handleEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-4">
            {/* About */}
            {user?.bio && (
              <Card className="mb-6">
                <CardHeader>
                  <h3 className="font-semibold text-lg">About</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {user.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="font-semibold text-lg">Experience</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-sm">TC</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Software Engineer</h4>
                    <p className="text-sm text-muted-foreground">TechCorp</p>
                    <p className="text-xs text-muted-foreground">Jan 2022 - Present • 2 yrs</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                    <span className="text-secondary-foreground font-semibold text-sm">IS</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Junior Developer</h4>
                    <p className="text-sm text-muted-foreground">InnovateSoft</p>
                    <p className="text-xs text-muted-foreground">Jun 2020 - Dec 2021 • 1 yr 7 mos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Education</h3>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-accent-foreground font-semibold text-sm">SU</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Computer Science</h4>
                    <p className="text-sm text-muted-foreground">Stanford University</p>
                    <p className="text-xs text-muted-foreground">2016 - 2020</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Posts */}
          <div className="col-span-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Activity</h2>
              <p className="text-sm text-muted-foreground">Posts and articles from {user?.firstName || "User"}</p>
            </div>
            
            {postsLoading ? (
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
            ) : userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post: Post) => (
                  <PostCard key={post._id} {...post} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No posts yet. Start sharing your thoughts!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default Profile;