import { useState } from "react"
import { useVehicleData, Vehicle } from "@/lib/vehicle-data"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Car, Search, Shield, AlertTriangle, CheckCircle, XCircle, 
  AlertCircle, IndianRupee, FileText, Clock
} from "lucide-react"

export default function PatrolOfficerDashboard() {
  const { user } = useAuth()
  const { 
    vehicles, compliance, penalties, 
    addPenalty, getVehicleByRegNo, getVehicleCompliance, getVehiclePenalties 
  } = useVehicleData()

  const [searchRegNo, setSearchRegNo] = useState("")
  const [searchResult, setSearchResult] = useState<Vehicle | null | "not_found">(null)
  const [activeTab, setActiveTab] = useState("check")

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [violationType, setViolationType] = useState("")
  const [fineAmount, setFineAmount] = useState("")
  const [location, setLocation] = useState("")
  const [penaltyIssued, setPenaltyIssued] = useState(false)

  const handleSearch = () => {
    if (!searchRegNo.trim()) return
    const vehicle = getVehicleByRegNo(searchRegNo.trim())
    setSearchResult(vehicle || "not_found")
  }

  const handleIssuePenalty = () => {
    if (!selectedVehicle || !violationType || !fineAmount || !location) return
    addPenalty({
      vehicleId: selectedVehicle.id,
      violationType,
      fineAmount: parseInt(fineAmount),
      paymentStatus: "Pending",
      issuedDate: new Date().toISOString().split("T")[0],
      issuedBy: user?.name || "Patrol Officer",
      location: location,
    })
    setPenaltyIssued(true)
    setTimeout(() => {
      setPenaltyIssued(false)
      setSelectedVehicle(null)
      setViolationType("")
      setFineAmount("")
      setLocation("")
    }, 3000)
  }

  const pendingPenalties = penalties.filter((p) => p.paymentStatus === "Pending")
  const totalPendingAmount = pendingPenalties.reduce((sum, p) => sum + p.fineAmount, 0)
  const nonCompliantVehicles = compliance.filter((c) => c.status === "Non-Compliant" || c.status === "Expired")

  const getComplianceStatus = (vehicleId: string) => {
    const comp = compliance.find((c) => c.vehicleId === vehicleId)
    return comp?.status || "Unknown"
  }

  const violationTypes = [
    { value: "expired_puc", label: "Expired PUC", fine: 5000 },
    { value: "no_puc", label: "No PUC Certificate", fine: 10000 },
    { value: "failed_puc", label: "Failed PUC Test - Still Plying", fine: 7500 },
    { value: "bs4_banned", label: "BS-IV Diesel in Restricted Zone", fine: 20000 },
    { value: "over_age_diesel", label: "Diesel Vehicle Over 10 Years", fine: 15000 },
    { value: "over_age_petrol", label: "Petrol Vehicle Over 15 Years", fine: 12000 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patrol Officer Dashboard</h1>
        <p className="text-muted-foreground">Verify vehicle compliance and issue penalties for violations</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Checked</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{vehicles.length}</div><p className="text-xs text-muted-foreground">Total in system</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{nonCompliantVehicles.length}</div><p className="text-xs text-muted-foreground">Expired/Failed PUC</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Penalties</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingPenalties.length}</div><p className="text-xs text-muted-foreground">Awaiting payment</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{totalPendingAmount.toLocaleString()}</div><p className="text-xs text-muted-foreground">Pending collection</p></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="check" className="gap-2"><Search className="h-4 w-4" />Check Vehicle</TabsTrigger>
          <TabsTrigger value="issue" className="gap-2"><FileText className="h-4 w-4" />Issue Challan</TabsTrigger>
          <TabsTrigger value="violations" className="gap-2"><AlertTriangle className="h-4 w-4" />Non-Compliant</TabsTrigger>
          <TabsTrigger value="penalties" className="gap-2"><Shield className="h-4 w-4" />All Penalties</TabsTrigger>
        </TabsList>

        {/* Check Vehicle Tab */}
        <TabsContent value="check">
          <Card>
            <CardHeader><CardTitle>Quick Vehicle Check</CardTitle><CardDescription>Enter vehicle registration number to verify PUC compliance</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input placeholder="Enter Registration Number (e.g., DL01AB1234)" value={searchRegNo} onChange={(e) => setSearchRegNo(e.target.value.toUpperCase())} className="uppercase text-lg" />
                </div>
                <Button onClick={handleSearch} size="lg" className="gap-2"><Search className="h-4 w-4" />Check</Button>
              </div>

              {searchResult === "not_found" && (
                <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Vehicle not found in the system. This vehicle may be unregistered.</AlertDescription></Alert>
              )}

              {searchResult && searchResult !== "not_found" && (
                <div className="space-y-4 mt-4">
                  {(() => {
                    const comp = getVehicleCompliance(searchResult.id)
                    const isCompliant = comp?.status === "Compliant"
                    const existingPenalties = getVehiclePenalties(searchResult.id)

                    return (
                      <>
                        <Card className={isCompliant ? "border-secondary border-2" : "border-destructive border-2"}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {isCompliant ? <CheckCircle className="h-16 w-16 text-secondary" /> : <XCircle className="h-16 w-16 text-destructive" />}
                                <div>
                                  <h3 className="text-2xl font-bold">{isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}</h3>
                                  <p className="text-muted-foreground">{isCompliant ? "Vehicle has valid PUC certificate" : "Vehicle PUC is expired or failed"}</p>
                                </div>
                              </div>
                              {!isCompliant && (
                                <Button variant="destructive" onClick={() => setSelectedVehicle(searchResult)}>Issue Penalty</Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" />Vehicle Details</CardTitle></CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Registration No:</span><span className="font-bold text-lg">{searchResult.regNo}</span></div>
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Owner:</span><span className="font-medium">{searchResult.ownerName}</span></div>
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Mobile:</span><span className="font-medium">{searchResult.ownerMobile}</span></div>
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Vehicle:</span><span className="font-medium">{searchResult.makerModel}</span></div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Fuel Type:</span><Badge variant="outline">{searchResult.fuelType}</Badge></div>
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">BS Stage:</span><Badge variant="outline">{searchResult.bsStage}</Badge></div>
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Registration Date:</span><span className="font-medium">{searchResult.regDate}</span></div>
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">PUC Expiry:</span><span className={`font-medium ${!isCompliant ? "text-destructive" : ""}`}>{comp?.pucExpiryDate || "No Record"}</span></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {existingPenalties.length > 0 && (
                          <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Existing Penalties ({existingPenalties.length})</CardTitle></CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader><TableRow><TableHead>Violation</TableHead><TableHead>Fine Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                  {existingPenalties.map((p) => (
                                    <TableRow key={p.id}>
                                      <TableCell>{p.violationType}</TableCell>
                                      <TableCell>₹{p.fineAmount.toLocaleString()}</TableCell>
                                      <TableCell>{p.issuedDate}</TableCell>
                                      <TableCell><Badge variant={p.paymentStatus === "Paid" ? "default" : "destructive"}>{p.paymentStatus}</Badge></TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )
                  })()}

                  {selectedVehicle && (
                    <Card className="border-destructive">
                      <CardHeader><CardTitle className="text-destructive">Issue Penalty</CardTitle><CardDescription>Issue environmental violation penalty for {selectedVehicle.regNo}</CardDescription></CardHeader>
                      <CardContent className="space-y-4">
                        {penaltyIssued ? (
                          <Alert className="bg-secondary/10 border-secondary"><CheckCircle className="h-4 w-4 text-secondary" /><AlertDescription className="text-secondary">Penalty issued successfully! Challan has been generated.</AlertDescription></Alert>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>Violation Type</Label>
                              <Select value={violationType} onValueChange={(value) => { setViolationType(value); const violation = violationTypes.find((v) => v.value === value); if (violation) setFineAmount(violation.fine.toString()) }}>
                                <SelectTrigger><SelectValue placeholder="Select violation type" /></SelectTrigger>
                                <SelectContent>{violationTypes.map((v) => (<SelectItem key={v.value} value={v.value}>{v.label} - ₹{v.fine.toLocaleString()}</SelectItem>))}</SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2"><Label>Fine Amount (₹)</Label><Input type="number" value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} placeholder="Enter fine amount" /></div>
                            <div className="space-y-2"><Label>Location of Violation</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter location (e.g., Main Road, Sector 12)" /></div>
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                              <div className="flex justify-between"><span className="text-muted-foreground">Issued By:</span><span className="font-medium">{user?.name}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span className="font-medium">{new Date().toLocaleDateString()}</span></div>
                            </div>
                            <div className="flex gap-4">
                              <Button variant="destructive" onClick={handleIssuePenalty} disabled={!violationType || !fineAmount || !location} className="flex-1">Issue Challan</Button>
                              <Button variant="outline" onClick={() => setSelectedVehicle(null)}>Cancel</Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issue Challan Tab */}
        <TabsContent value="issue">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Search Vehicle</CardTitle><CardDescription>Search for a vehicle to issue challan</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter Registration Number" value={searchRegNo} onChange={(e) => setSearchRegNo(e.target.value.toUpperCase())} className="uppercase" />
                  <Button onClick={() => { const vehicle = getVehicleByRegNo(searchRegNo.trim()); if (vehicle) { setSelectedVehicle(vehicle); setSearchResult(vehicle) } else { setSearchResult("not_found") } }}>Search</Button>
                </div>
                {searchResult === "not_found" && (<Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Vehicle not found in the system.</AlertDescription></Alert>)}
                {selectedVehicle && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-semibold">Selected Vehicle</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Reg No:</span><span className="font-bold">{selectedVehicle.regNo}</span>
                      <span className="text-muted-foreground">Owner:</span><span>{selectedVehicle.ownerName}</span>
                      <span className="text-muted-foreground">Mobile:</span><span>{selectedVehicle.ownerMobile}</span>
                      <span className="text-muted-foreground">Vehicle:</span><span>{selectedVehicle.makerModel}</span>
                      <span className="text-muted-foreground">Fuel:</span><span>{selectedVehicle.fuelType}</span>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground">Or select from non-compliant vehicles:</Label>
                  <div className="mt-2 max-h-[200px] overflow-y-auto space-y-2">
                    {vehicles.filter((v) => { const status = getComplianceStatus(v.id); return status === "Non-Compliant" || status === "Expired" }).map((vehicle) => (
                      <Button key={vehicle.id} variant={selectedVehicle?.id === vehicle.id ? "default" : "outline"} size="sm" className="w-full justify-start gap-2" onClick={() => setSelectedVehicle(vehicle)}>
                        <AlertTriangle className="h-3 w-3 text-destructive" />{vehicle.regNo} - {vehicle.ownerName}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader className="bg-destructive/5">
                <CardTitle className="flex items-center gap-2 text-destructive"><AlertCircle className="h-5 w-5" />Issue Challan</CardTitle>
                <CardDescription>Record violation and generate penalty challan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {penaltyIssued ? (
                  <Alert className="bg-secondary/10 border-secondary"><CheckCircle className="h-4 w-4 text-secondary" /><AlertDescription className="text-secondary">Challan issued successfully! Owner will be notified.</AlertDescription></Alert>
                ) : (
                  <>
                    {!selectedVehicle && (<Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please search and select a vehicle first to issue challan.</AlertDescription></Alert>)}
                    <div className="space-y-2">
                      <Label>Violation Type</Label>
                      <Select value={violationType} onValueChange={(value) => { setViolationType(value); const violation = violationTypes.find((v) => v.value === value); if (violation) setFineAmount(violation.fine.toString()) }} disabled={!selectedVehicle}>
                        <SelectTrigger><SelectValue placeholder="Select violation type" /></SelectTrigger>
                        <SelectContent>{violationTypes.map((v) => (<SelectItem key={v.value} value={v.value}>{v.label} - ₹{v.fine.toLocaleString()}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Location of Violation</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter location (e.g., Main Road, Sector 12)" disabled={!selectedVehicle} /></div>
                    <div className="space-y-2"><Label>Fine Amount (₹)</Label><Input type="number" value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} placeholder="Fine amount" disabled={!selectedVehicle} /></div>
                    {selectedVehicle && violationType && fineAmount && location && (
                      <div className="p-4 bg-destructive/10 rounded-lg space-y-2 border border-destructive/30">
                        <h4 className="font-semibold text-destructive">Challan Summary</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Vehicle:</span><span className="font-bold">{selectedVehicle.regNo}</span>
                          <span className="text-muted-foreground">Owner:</span><span>{selectedVehicle.ownerName}</span>
                          <span className="text-muted-foreground">Violation:</span><span>{violationTypes.find(v => v.value === violationType)?.label}</span>
                          <span className="text-muted-foreground">Location:</span><span>{location}</span>
                          <span className="text-muted-foreground">Fine:</span><span className="font-bold text-destructive">₹{parseInt(fineAmount).toLocaleString()}</span>
                          <span className="text-muted-foreground">Date:</span><span>{new Date().toLocaleDateString()}</span>
                          <span className="text-muted-foreground">Officer:</span><span>{user?.name}</span>
                        </div>
                      </div>
                    )}
                    <Button variant="destructive" onClick={handleIssuePenalty} disabled={!selectedVehicle || !violationType || !fineAmount || !location} className="w-full" size="lg">
                      <FileText className="h-4 w-4 mr-2" />Issue Challan
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Non-Compliant Vehicles Tab */}
        <TabsContent value="violations">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Non-Compliant Vehicles</CardTitle><CardDescription>Vehicles with expired or failed PUC certificates</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Reg. No.</TableHead><TableHead>Owner</TableHead><TableHead>Vehicle</TableHead><TableHead>Fuel Type</TableHead><TableHead>BS Stage</TableHead><TableHead>Status</TableHead><TableHead>PUC Expiry</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vehicles.filter((v) => { const status = getComplianceStatus(v.id); return status === "Non-Compliant" || status === "Expired" }).map((vehicle) => {
                    const comp = getVehicleCompliance(vehicle.id)
                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.regNo}</TableCell>
                        <TableCell>{vehicle.ownerName}</TableCell>
                        <TableCell>{vehicle.makerModel}</TableCell>
                        <TableCell><Badge variant="outline">{vehicle.fuelType}</Badge></TableCell>
                        <TableCell>{vehicle.bsStage}</TableCell>
                        <TableCell><Badge variant="destructive">{comp?.status}</Badge></TableCell>
                        <TableCell className="text-destructive">{comp?.pucExpiryDate}</TableCell>
                        <TableCell><Button size="sm" variant="destructive" onClick={() => { setSelectedVehicle(vehicle); setActiveTab("check") }}>Issue Penalty</Button></TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Penalties Tab */}
        <TabsContent value="penalties">
          <Card>
            <CardHeader><CardTitle>Penalties Issued</CardTitle><CardDescription>All environmental violation penalties in the system</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Owner</TableHead><TableHead>Violation Type</TableHead><TableHead>Location</TableHead><TableHead>Fine Amount</TableHead><TableHead>Issued Date</TableHead><TableHead>Issued By</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {penalties.map((penalty) => {
                    const vehicle = vehicles.find((v) => v.id === penalty.vehicleId)
                    return (
                      <TableRow key={penalty.id}>
                        <TableCell className="font-medium">{vehicle?.regNo || "N/A"}</TableCell>
                        <TableCell>{vehicle?.ownerName || "N/A"}</TableCell>
                        <TableCell>{penalty.violationType}</TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">{penalty.location || "N/A"}</TableCell>
                        <TableCell className="font-medium tabular-nums">₹{penalty.fineAmount.toLocaleString()}</TableCell>
                        <TableCell>{penalty.issuedDate}</TableCell>
                        <TableCell>{penalty.issuedBy}</TableCell>
                        <TableCell><Badge variant={penalty.paymentStatus === "Paid" ? "default" : "destructive"} className="gap-1">{penalty.paymentStatus === "Pending" && <Clock className="h-3 w-3" />}{penalty.paymentStatus}</Badge></TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
