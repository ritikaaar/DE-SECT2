import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useNavigate } from "react-router-dom"

export type UserRole = "user" | "puc_officer" | "patrol_officer"

export interface User {
  id: string
  username: string
  role: UserRole
  name: string
  vehicleIds?: string[]
  mobile?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  user: {
    password: "user123",
    user: {
      id: "1",
      username: "user",
      role: "user",
      name: "Rajesh Kumar",
      vehicleIds: ["v1"],
      mobile: "9876543210",
    },
  },
  priya: {
    password: "priya123",
    user: {
      id: "4",
      username: "priya",
      role: "user",
      name: "Priya Sharma",
      vehicleIds: ["v2"],
      mobile: "9876543211",
    },
  },
  amit: {
    password: "amit123",
    user: {
      id: "5",
      username: "amit",
      role: "user",
      name: "Amit Singh",
      vehicleIds: ["v3"],
      mobile: "9876543212",
    },
  },
  puc_officer: {
    password: "puc123",
    user: {
      id: "2",
      username: "puc_officer",
      role: "puc_officer",
      name: "PUC Testing Officer",
    },
  },
  patrol_officer: {
    password: "patrol123",
    user: {
      id: "3",
      username: "patrol_officer",
      role: "patrol_officer",
      name: "Traffic Patrol Officer",
    },
  },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem("desect_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const demoUser = DEMO_USERS[username]
    
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user)
      localStorage.setItem("desect_user", JSON.stringify(demoUser.user))
      
      switch (demoUser.user.role) {
        case "user":
          navigate("/dashboard/user")
          break
        case "puc_officer":
          navigate("/dashboard/puc-officer")
          break
        case "patrol_officer":
          navigate("/dashboard/patrol-officer")
          break
      }
      
      return { success: true }
    }
    
    return { success: false, error: "Invalid username or password" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("desect_user")
    navigate("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
