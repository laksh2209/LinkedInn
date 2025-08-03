import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Image, Calendar, FileText, Video } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CreatePost = () => {
  const [postContent, setPostContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: (content: string) => apiService.createPost({ content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setPostContent("");
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handlePost = () => {
    if (!postContent.trim()) return;
    
    createPostMutation.mutate(postContent);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[80px] border-0 bg-transparent text-lg placeholder:text-muted-foreground resize-none focus-visible:ring-0"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-accent">
              <Image className="h-5 w-5 mr-2" />
              Photo
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-accent">
              <Video className="h-5 w-5 mr-2" />
              Video
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-accent">
              <Calendar className="h-5 w-5 mr-2" />
              Event
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-accent">
              <FileText className="h-5 w-5 mr-2" />
              Article
            </Button>
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            disabled={!postContent.trim() || loading}
            onClick={handlePost}
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;