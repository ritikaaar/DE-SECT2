import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Car, Users, Leaf, AlertCircle, Lock, User } from "lucide-react"

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string>("user")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const result = await login(username, password)
    
    if (!result.success) {
      setError(result.error || "Login failed")
    }
    
    setIsSubmitting(false)
  }

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    switch (role) {
      case "user":
        setUsername("user")
        setPassword("user123")
        break
      case "puc_officer":
        setUsername("puc_officer")
        setPassword("puc123")
        break
      case "patrol_officer":
        setUsername("patrol_officer")
        setPassword("patrol123")
        break
    }
    setError("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">DE-SECT</h1>
                <p className="text-xs text-primary-foreground/80">Delhi Emission & Scrap Compliance Tracker</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              <span>Government of NCT Delhi</span>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-secondary text-secondary-foreground py-2">
        <div className="container mx-auto px-4">
          <p className="text-sm text-center">
            Vehicle Emission Monitoring & Compliance Management System - Delhi Transport Department
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 border-l-4 border-l-secondary bg-card">
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <Car className="h-10 w-10 text-secondary" />
                <div>
                  <h2 className="font-semibold text-card-foreground">Welcome to DE-SECT Portal</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    This portal enables real-time tracking of vehicle emissions, PUC compliance, 
                    and enforcement of Delhi 2026 Clean Air mandates. Select your role to access 
                    the appropriate dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Select Your Role
                </CardTitle>
                <CardDescription>
                  Choose your user type to access the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedRole} onValueChange={handleRoleSelect}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="user">User</TabsTrigger>
                    <TabsTrigger value="puc_officer">PUC Officer</TabsTrigger>
                    <TabsTrigger value="patrol_officer">Patrol</TabsTrigger>
                  </TabsList>
                  <TabsContent value="user" className="mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium text-foreground">Vehicle Owner</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        View your vehicle details, PUC test history, compliance status, 
                        and any challans/penalties issued to your vehicles.
                      </p>
                      <div className="mt-4 p-3 bg-card rounded border space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Demo Credentials (3 Users):</p>
                        <div className="text-sm space-y-1">
                          <p><code className="bg-muted px-1 rounded">user / user123</code> - Rajesh Kumar (DL01AB1234)</p>
                          <p><code className="bg-muted px-1 rounded">priya / priya123</code> - Priya Sharma (DL02CD5678)</p>
                          <p><code className="bg-muted px-1 rounded">amit / amit123</code> - Amit Singh (DL03EF9012)</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="puc_officer" className="mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium text-foreground">PUC Testing Officer</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Conduct emission tests, issue PUC certificates, record test results, 
                        and update vehicle compliance status.
                      </p>
                      <div className="mt-4 p-3 bg-card rounded border">
                        <p className="text-xs font-medium text-muted-foreground">Demo Credentials:</p>
                        <p className="text-sm">Username: <code className="bg-muted px-1 rounded">puc_officer</code></p>
                        <p className="text-sm">Password: <code className="bg-muted px-1 rounded">puc123</code></p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="patrol_officer" className="mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium text-foreground">Traffic Patrol Officer</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Check vehicle compliance on-road, verify PUC validity, 
                        issue penalties for violations, and enforce regulations.
                      </p>
                      <div className="mt-4 p-3 bg-card rounded border">
                        <p className="text-xs font-medium text-muted-foreground">Demo Credentials:</p>
                        <p className="text-sm">Username: <code className="bg-muted px-1 rounded">patrol_officer</code></p>
                        <p className="text-sm">Password: <code className="bg-muted px-1 rounded">patrol123</code></p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Sign In
                </CardTitle>
                <CardDescription>
                  Enter your credentials to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-foreground mb-2">Quick Access</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Click on a role above to auto-fill demo credentials, then click Sign In.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <Car className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium text-foreground">Vehicle Tracking</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive vehicle lifecycle management
                </p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-secondary/30">
              <CardContent className="pt-6">
                <Leaf className="h-8 w-8 text-secondary mb-2" />
                <h3 className="font-medium text-foreground">Emission Monitoring</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time emission test results tracking
                </p>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-destructive mb-2" />
                <h3 className="font-medium text-foreground">Compliance Enforcement</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Automated penalty generation system
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-primary text-primary-foreground mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Delhi Transport Department - Government of NCT Delhi</p>
          <p className="text-primary-foreground/70 mt-1">
            DE-SECT Portal v1.0 - Supporting Delhi 2026 Clean Air Initiative
          </p>
        </div>
      </footer>
    </div>
  )
}
