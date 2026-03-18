import { useAuth } from "@/lib/auth-context"
import { useNavigate, Link, Outlet } from "react-router-dom"
import { useEffect } from "react"
import { Leaf, LogOut, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout() {
  const { user, logout, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleName = () => {
    switch (user.role) {
      case "user":
        return "System User"
      case "puc_officer":
        return "PUC Officer"
      case "patrol_officer":
        return "Patrol Officer"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-7 w-7" />
              <div>
                <h1 className="text-lg font-bold">DE-SECT</h1>
                <p className="text-xs text-primary-foreground/80">Delhi Transport Department</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-primary-foreground/80">{getRoleName()}</p>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={logout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-secondary text-secondary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="flex items-center gap-1 hover:underline">
              <Home className="h-3 w-3" />
              Home
            </Link>
            <span>/</span>
            <span>{getRoleName()} Dashboard</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-primary text-primary-foreground py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Delhi Transport Department - Government of NCT Delhi</p>
          <p className="text-primary-foreground/70 mt-1">DE-SECT Portal v1.0</p>
        </div>
      </footer>
    </div>
  )
}
