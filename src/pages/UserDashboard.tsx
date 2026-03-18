import { useAuth } from "@/lib/auth-context"
import { useVehicleData } from "@/lib/vehicle-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Car, ClipboardCheck, AlertTriangle, IndianRupee, FileText, User, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function UserDashboard() {
  const { user } = useAuth()
  const { vehicles, emissionTests, compliance, penalties, payPenalty } = useVehicleData()

  const userVehicleIds = user?.vehicleIds || []
  const userVehicles = vehicles.filter((v) => userVehicleIds.includes(v.id))
  const userTests = emissionTests.filter((t) => userVehicleIds.includes(t.vehicleId))
  const userCompliance = compliance.filter((c) => userVehicleIds.includes(c.vehicleId))
  const userPenalties = penalties.filter((p) => userVehicleIds.includes(p.vehicleId))

  const totalVehicles = userVehicles.length
  const compliantVehicles = userCompliance.filter((c) => c.status === "Compliant").length
  const expiredPUC = userCompliance.filter((c) => c.status === "Expired" || c.status === "Non-Compliant").length
  const pendingPenalties = userPenalties.filter((p) => p.paymentStatus === "Pending").length
  const totalPenaltyAmount = userPenalties
    .filter((p) => p.paymentStatus === "Pending")
    .reduce((sum, p) => sum + p.fineAmount, 0)

  const getComplianceStatus = (vehicleId: string) => {
    const comp = compliance.find((c) => c.vehicleId === vehicleId)
    return comp?.status || "Unknown"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Compliant":
        return <Badge className="bg-secondary text-secondary-foreground">Compliant</Badge>
      case "Non-Compliant":
        return <Badge variant="destructive">Non-Compliant</Badge>
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handlePayFine = (penaltyId: string, amount: number) => {
    payPenalty(penaltyId)
    toast.success(`Payment of ₹${amount.toLocaleString()} successful!`, {
      description: "Your fine has been marked as Paid.",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
              <p className="text-muted-foreground">Mobile: {user?.mobile || "N/A"}</p>
              <p className="text-sm text-muted-foreground">View your vehicle information and compliance status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant Vehicles</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{compliantVehicles}</div>
            <p className="text-xs text-muted-foreground">Valid PUC certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredPUC}</div>
            <p className="text-xs text-muted-foreground">Expired/Failed PUC</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fines</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPenaltyAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pendingPenalties} penalties pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles" className="gap-2">
            <Car className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="tests" className="gap-2">
            <FileText className="h-4 w-4" />
            Emission Tests
          </TabsTrigger>
          <TabsTrigger value="penalties" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Penalties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>My Vehicles</CardTitle>
              <CardDescription>Your registered vehicles in the DE-SECT system</CardDescription>
            </CardHeader>
            <CardContent>
              {userVehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vehicles registered under your account.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg. No.</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>BS Stage</TableHead>
                      <TableHead>Reg. Date</TableHead>
                      <TableHead>Engine No.</TableHead>
                      <TableHead>Chassis No.</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-bold text-lg">{vehicle.regNo}</TableCell>
                        <TableCell>{vehicle.makerModel}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{vehicle.fuelType}</Badge>
                        </TableCell>
                        <TableCell>{vehicle.bsStage}</TableCell>
                        <TableCell>{vehicle.regDate}</TableCell>
                        <TableCell className="font-mono text-xs">{vehicle.engineNo}</TableCell>
                        <TableCell className="font-mono text-xs">{vehicle.chassisNo}</TableCell>
                        <TableCell>{getStatusBadge(getComplianceStatus(vehicle.id))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>My PUC Test History</CardTitle>
              <CardDescription>Your vehicle emission test records</CardDescription>
            </CardHeader>
            <CardContent>
              {userTests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No emission tests found for your vehicles.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>CO2 Level</TableHead>
                      <TableHead>PM Level</TableHead>
                      <TableHead>Test Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Tested By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTests.map((test) => {
                      const vehicle = userVehicles.find((v) => v.id === test.vehicleId)
                      return (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{vehicle?.regNo || "N/A"}</TableCell>
                          <TableCell>{test.co2Level}%</TableCell>
                          <TableCell>{test.pmLevel} mg/m³</TableCell>
                          <TableCell>{test.testDate}</TableCell>
                          <TableCell>{test.expiryDate}</TableCell>
                          <TableCell>
                            <Badge className={test.result === "Pass" ? "bg-secondary text-secondary-foreground" : ""} variant={test.result === "Pass" ? "default" : "destructive"}>
                              {test.result}
                            </Badge>
                          </TableCell>
                          <TableCell>{test.testedBy}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="penalties">
          <Card>
            <CardHeader>
              <CardTitle>My Challans / Penalties</CardTitle>
              <CardDescription>Environmental violation penalties issued to your vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              {userPenalties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No penalties found. Keep your vehicle compliant!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Violation Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Fine Amount</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Issued By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPenalties.map((penalty) => {
                      const vehicle = userVehicles.find((v) => v.id === penalty.vehicleId)
                      return (
                        <TableRow key={penalty.id}>
                          <TableCell className="font-medium">{vehicle?.regNo || "N/A"}</TableCell>
                          <TableCell>{penalty.violationType}</TableCell>
                          <TableCell className="text-sm">{penalty.location || "N/A"}</TableCell>
                          <TableCell className="font-bold tabular-nums text-destructive">₹{penalty.fineAmount.toLocaleString()}</TableCell>
                          <TableCell>{penalty.issuedDate}</TableCell>
                          <TableCell>{penalty.issuedBy}</TableCell>
                          <TableCell>
                            <Badge variant={penalty.paymentStatus === "Paid" ? "default" : "destructive"}>
                              {penalty.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {penalty.paymentStatus === "Pending" ? (
                              <Button 
                                size="sm" 
                                onClick={() => handlePayFine(penalty.id, penalty.fineAmount)}
                                className="gap-1"
                              >
                                <IndianRupee className="h-3 w-3" />
                                Pay Now
                              </Button>
                            ) : (
                              <span className="flex items-center gap-1 text-sm text-secondary">
                                <CheckCircle className="h-4 w-4" />
                                Paid
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
