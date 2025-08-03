
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Home, Users, MessageSquare, Bell, Briefcase, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">in</span>
            </div>
            <span className="font-bold text-xl text-foreground">LinkedInn</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search" 
                className="pl-10 bg-accent border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/" className={`flex flex-col items-center p-2 hover:text-primary transition-colors ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            
            <Link to="/profile" className={`flex flex-col items-center p-2 hover:text-primary transition-colors ${
              isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">My Network</span>
            </Link>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs mt-1">Me</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
