import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/lib/api";

interface PostCardProps extends Post {}

const PostCard = ({ 
  author, 
  content, 
  createdAt, 
  likeCount = 0, 
  commentCount = 0, 
  shareCount = 0,
  likes = [],
  comments = [],
  shares = []
}: PostCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={author.profilePicture} />
              <AvatarFallback className="text-sm font-medium">
                {author.firstName?.[0]}{author.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                {author.fullName || `${author.firstName} ${author.lastName}`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {author.title && author.company 
                  ? `${author.title} at ${author.company}`
                  : author.title || author.company || "Professional"
                }
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          <p className="text-foreground leading-relaxed">{content}</p>
        </div>
        
        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border pb-3 mb-3">
          <div className="flex items-center space-x-4">
            {likeCount > 0 && (
              <span className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center mr-1">
                  <Heart className="h-2.5 w-2.5 text-primary-foreground fill-current" />
                </div>
                {likeCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {commentCount > 0 && <span>{commentCount} comments</span>}
            {shareCount > 0 && <span>{shareCount} reposts</span>}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-primary hover:bg-accent">
            <Heart className="h-4 w-4 mr-2" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-primary hover:bg-accent">
            <MessageCircle className="h-4 w-4 mr-2" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-primary hover:bg-accent">
            <Repeat2 className="h-4 w-4 mr-2" />
            Repost
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-primary hover:bg-accent">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;