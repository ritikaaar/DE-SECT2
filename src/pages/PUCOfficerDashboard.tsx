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
  Car, ClipboardCheck, Search, Plus, FileText, CheckCircle, XCircle, 
  AlertCircle, Calendar, Gauge, Wind
} from "lucide-react"

export default function PUCOfficerDashboard() {
  const { user } = useAuth()
  const { 
    vehicles, emissionTests, compliance, 
    addVehicle, addEmissionTest, getVehicleByRegNo, getVehicleTests, getVehicleCompliance 
  } = useVehicleData()

  const [searchRegNo, setSearchRegNo] = useState("")
  const [searchResult, setSearchResult] = useState<Vehicle | null | "not_found">(null)
  const [activeTab, setActiveTab] = useState("search")

  const [newVehicle, setNewVehicle] = useState({
    regNo: "",
    ownerName: "",
    ownerMobile: "",
    fuelType: "Petrol" as const,
    bsStage: "BS-VI" as const,
    regDate: "",
    vehicleClass: "LMV",
    engineNo: "",
    chassisNo: "",
    makerModel: "",
  })

  const [testVehicle, setTestVehicle] = useState<Vehicle | null>(null)
  const [newTest, setNewTest] = useState({
    co2Level: "",
    pmLevel: "",
  })
  const [testResult, setTestResult] = useState<"Pass" | "Fail" | null>(null)
  const [vehicleAdded, setVehicleAdded] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)

  const handleSearch = () => {
    if (!searchRegNo.trim()) return
    const vehicle = getVehicleByRegNo(searchRegNo.trim())
    setSearchResult(vehicle || "not_found")
  }

  const handleAddVehicle = () => {
    if (!newVehicle.regNo || !newVehicle.ownerName) return
    addVehicle(newVehicle)
    setNewVehicle({
      regNo: "", ownerName: "", ownerMobile: "", fuelType: "Petrol",
      bsStage: "BS-VI", regDate: "", vehicleClass: "LMV", engineNo: "", chassisNo: "", makerModel: "",
    })
    setVehicleAdded(true)
    setTimeout(() => setVehicleAdded(false), 3000)
  }

  const handleConductTest = () => {
    if (!testVehicle || !newTest.co2Level || !newTest.pmLevel) return
    const co2 = parseFloat(newTest.co2Level)
    const pm = parseFloat(newTest.pmLevel)
    const isPass = co2 <= 3.5 && pm <= 100
    const today = new Date()
    const expiryDate = new Date(today)
    expiryDate.setMonth(expiryDate.getMonth() + 6)

    addEmissionTest({
      vehicleId: testVehicle.id,
      stationId: "s1",
      co2Level: co2,
      pmLevel: pm,
      testDate: today.toISOString().split("T")[0],
      expiryDate: expiryDate.toISOString().split("T")[0],
      result: isPass ? "Pass" : "Fail",
      testedBy: user?.name || "PUC Officer",
    })

    setTestResult(isPass ? "Pass" : "Fail")
    setTestCompleted(true)
  }

  const resetTestForm = () => {
    setTestVehicle(null)
    setNewTest({ co2Level: "", pmLevel: "" })
    setTestResult(null)
    setTestCompleted(false)
  }

  const todayTests = emissionTests.filter(
    (t) => t.testDate === new Date().toISOString().split("T")[0]
  )

  const getComplianceStatus = (vehicleId: string) => {
    const comp = compliance.find((c) => c.vehicleId === vehicleId)
    return comp?.status || "Unknown"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">PUC Officer Dashboard</h1>
        <p className="text-muted-foreground">Conduct emission tests and manage vehicle PUC certificates</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{vehicles.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Today</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayTests.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{emissionTests.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emissionTests.length > 0 
                ? Math.round((emissionTests.filter(t => t.result === "Pass").length / emissionTests.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="gap-2"><Search className="h-4 w-4" />Search Vehicle</TabsTrigger>
          <TabsTrigger value="conduct-test" className="gap-2"><Gauge className="h-4 w-4" />Conduct Test</TabsTrigger>
          <TabsTrigger value="add-vehicle" className="gap-2"><Plus className="h-4 w-4" />Add Vehicle</TabsTrigger>
          <TabsTrigger value="test-history" className="gap-2"><FileText className="h-4 w-4" />Test History</TabsTrigger>
        </TabsList>

        {/* Search Vehicle Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Vehicle</CardTitle>
              <CardDescription>Enter vehicle registration number to view details and compliance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input placeholder="Enter Registration Number (e.g., DL01AB1234)" value={searchRegNo} onChange={(e) => setSearchRegNo(e.target.value.toUpperCase())} className="uppercase" />
                </div>
                <Button onClick={handleSearch} className="gap-2"><Search className="h-4 w-4" />Search</Button>
              </div>

              {searchResult === "not_found" && (
                <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Vehicle not found. Please check the registration number or add a new vehicle.</AlertDescription></Alert>
              )}

              {searchResult && searchResult !== "not_found" && (
                <div className="space-y-4 mt-4">
                  <Card className="border-primary">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" />Vehicle Information</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Registration No:</span><span className="font-medium">{searchResult.regNo}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Owner Name:</span><span className="font-medium">{searchResult.ownerName}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Mobile:</span><span className="font-medium">{searchResult.ownerMobile}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Maker/Model:</span><span className="font-medium">{searchResult.makerModel}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Vehicle Class:</span><span className="font-medium">{searchResult.vehicleClass}</span></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Fuel Type:</span><Badge variant="outline">{searchResult.fuelType}</Badge></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">BS Stage:</span><Badge variant="outline">{searchResult.bsStage}</Badge></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Registration Date:</span><span className="font-medium">{searchResult.regDate}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Engine No:</span><span className="font-medium">{searchResult.engineNo}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Chassis No:</span><span className="font-medium">{searchResult.chassisNo}</span></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" />PUC Compliance Status</CardTitle></CardHeader>
                    <CardContent>
                      {(() => {
                        const comp = getVehicleCompliance(searchResult.id)
                        const tests = getVehicleTests(searchResult.id)
                        const latestTest = tests.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0]
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                              <span className="font-medium">Current Status:</span>
                              <Badge className={comp?.status === "Compliant" ? "bg-secondary text-secondary-foreground" : ""} variant={comp?.status === "Compliant" ? "default" : "destructive"}>{comp?.status || "No Record"}</Badge>
                            </div>
                            {comp && (
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex justify-between"><span className="text-muted-foreground">PUC Expiry Date:</span><span className="font-medium">{comp.pucExpiryDate}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">ZTE Compliant:</span><Badge variant={comp.isZteCompliant ? "default" : "outline"}>{comp.isZteCompliant ? "Yes" : "No"}</Badge></div>
                              </div>
                            )}
                            {latestTest && (
                              <div className="mt-4 p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Last Test Results</h4>
                                <div className="grid md:grid-cols-4 gap-4 text-sm">
                                  <div><span className="text-muted-foreground">Date:</span><p className="font-medium">{latestTest.testDate}</p></div>
                                  <div><span className="text-muted-foreground">CO2 Level:</span><p className="font-medium">{latestTest.co2Level}%</p></div>
                                  <div><span className="text-muted-foreground">PM Level:</span><p className="font-medium">{latestTest.pmLevel} mg/m³</p></div>
                                  <div><span className="text-muted-foreground">Result:</span><Badge className={latestTest.result === "Pass" ? "bg-secondary text-secondary-foreground" : ""} variant={latestTest.result === "Pass" ? "default" : "destructive"}>{latestTest.result}</Badge></div>
                                </div>
                              </div>
                            )}
                            <Button onClick={() => { setTestVehicle(searchResult); setActiveTab("conduct-test") }} className="w-full gap-2"><Gauge className="h-4 w-4" />Conduct New PUC Test</Button>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conduct Test Tab */}
        <TabsContent value="conduct-test">
          <Card>
            <CardHeader><CardTitle>Conduct PUC Test</CardTitle><CardDescription>Record emission test results for a vehicle</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {!testVehicle ? (
                <div className="space-y-4">
                  <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Select a vehicle to conduct PUC test. You can search for a vehicle first or select from the list below.</AlertDescription></Alert>
                  <div className="flex gap-4">
                    <Input placeholder="Enter Registration Number" value={searchRegNo} onChange={(e) => setSearchRegNo(e.target.value.toUpperCase())} className="uppercase" />
                    <Button onClick={() => { const vehicle = getVehicleByRegNo(searchRegNo); if (vehicle) setTestVehicle(vehicle) }}>Select Vehicle</Button>
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader><TableRow><TableHead>Reg. No.</TableHead><TableHead>Owner</TableHead><TableHead>Vehicle</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {vehicles.slice(0, 5).map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell className="font-medium">{vehicle.regNo}</TableCell>
                            <TableCell>{vehicle.ownerName}</TableCell>
                            <TableCell>{vehicle.makerModel}</TableCell>
                            <TableCell><Badge className={getComplianceStatus(vehicle.id) === "Compliant" ? "bg-secondary text-secondary-foreground" : ""} variant={getComplianceStatus(vehicle.id) === "Compliant" ? "default" : "destructive"}>{getComplianceStatus(vehicle.id)}</Badge></TableCell>
                            <TableCell><Button size="sm" onClick={() => setTestVehicle(vehicle)}>Select</Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Car className="h-10 w-10 text-primary" />
                          <div>
                            <h3 className="font-bold text-lg">{testVehicle.regNo}</h3>
                            <p className="text-muted-foreground">{testVehicle.ownerName} - {testVehicle.makerModel}</p>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => setTestVehicle(null)}>Change Vehicle</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {testCompleted ? (
                    <Card className={testResult === "Pass" ? "border-secondary" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          {testResult === "Pass" ? <CheckCircle className="h-16 w-16 text-secondary mx-auto" /> : <XCircle className="h-16 w-16 text-destructive mx-auto" />}
                          <h3 className="text-2xl font-bold">Test {testResult === "Pass" ? "Passed" : "Failed"}</h3>
                          <p className="text-muted-foreground">{testResult === "Pass" ? "PUC Certificate has been issued. Valid for 6 months." : "Vehicle failed emission standards. PUC Certificate not issued. A ₹5,000 penalty has been auto-generated."}</p>
                          <Button onClick={resetTestForm}>Conduct Another Test</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2"><Wind className="h-4 w-4" />Emission Readings</h4>
                          <div className="space-y-2">
                            <Label htmlFor="co2">CO2 Level (%)</Label>
                            <Input id="co2" type="number" step="0.1" placeholder="Enter CO2 percentage (0-5)" value={newTest.co2Level} onChange={(e) => setNewTest(prev => ({ ...prev, co2Level: e.target.value }))} />
                            <p className="text-xs text-muted-foreground">Standard: ≤ 3.5% for Pass</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pm">Particulate Matter (mg/m³)</Label>
                            <Input id="pm" type="number" step="1" placeholder="Enter PM level (0-200)" value={newTest.pmLevel} onChange={(e) => setNewTest(prev => ({ ...prev, pmLevel: e.target.value }))} />
                            <p className="text-xs text-muted-foreground">Standard: ≤ 100 mg/m³ for Pass</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4" />Test Information</h4>
                          <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex justify-between"><span className="text-muted-foreground">Test Date:</span><span className="font-medium">{new Date().toLocaleDateString()}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Testing Officer:</span><span className="font-medium">{user?.name}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Station ID:</span><span className="font-medium">S001</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Validity (if Pass):</span><span className="font-medium">6 Months</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button onClick={handleConductTest} disabled={!newTest.co2Level || !newTest.pmLevel} className="flex-1 gap-2"><ClipboardCheck className="h-4 w-4" />Submit Test Results</Button>
                        <Button variant="outline" onClick={resetTestForm}>Cancel</Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Vehicle Tab */}
        <TabsContent value="add-vehicle">
          <Card>
            <CardHeader><CardTitle>Add New Vehicle</CardTitle><CardDescription>Register a new vehicle in the DE-SECT system</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {vehicleAdded && (
                <Alert className="bg-secondary/10 border-secondary"><CheckCircle className="h-4 w-4 text-secondary" /><AlertDescription className="text-secondary">Vehicle added successfully!</AlertDescription></Alert>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Vehicle Details</h4>
                  <div className="space-y-2"><Label htmlFor="regNo">Registration Number *</Label><Input id="regNo" placeholder="e.g., DL01AB1234" value={newVehicle.regNo} onChange={(e) => setNewVehicle(prev => ({ ...prev, regNo: e.target.value.toUpperCase() }))} className="uppercase" /></div>
                  <div className="space-y-2"><Label htmlFor="makerModel">Maker/Model *</Label><Input id="makerModel" placeholder="e.g., Maruti Swift" value={newVehicle.makerModel} onChange={(e) => setNewVehicle(prev => ({ ...prev, makerModel: e.target.value }))} /></div>
                  <div className="space-y-2">
                    <Label>Vehicle Class</Label>
                    <Select value={newVehicle.vehicleClass} onValueChange={(value) => setNewVehicle(prev => ({ ...prev, vehicleClass: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LMV">LMV (Light Motor Vehicle)</SelectItem>
                        <SelectItem value="HMV">HMV (Heavy Motor Vehicle)</SelectItem>
                        <SelectItem value="2W">Two Wheeler</SelectItem>
                        <SelectItem value="3W">Three Wheeler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel Type *</Label>
                    <Select value={newVehicle.fuelType} onValueChange={(value: "Petrol" | "Diesel" | "CNG" | "EV") => setNewVehicle(prev => ({ ...prev, fuelType: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="CNG">CNG</SelectItem>
                        <SelectItem value="EV">Electric (EV)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>BS Stage *</Label>
                    <Select value={newVehicle.bsStage} onValueChange={(value: "BS-IV" | "BS-VI") => setNewVehicle(prev => ({ ...prev, bsStage: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BS-IV">BS-IV</SelectItem>
                        <SelectItem value="BS-VI">BS-VI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Owner & Technical Details</h4>
                  <div className="space-y-2"><Label>Owner Name *</Label><Input placeholder="Full name" value={newVehicle.ownerName} onChange={(e) => setNewVehicle(prev => ({ ...prev, ownerName: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Owner Mobile</Label><Input placeholder="10-digit mobile" value={newVehicle.ownerMobile} onChange={(e) => setNewVehicle(prev => ({ ...prev, ownerMobile: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Registration Date</Label><Input type="date" value={newVehicle.regDate} onChange={(e) => setNewVehicle(prev => ({ ...prev, regDate: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Engine Number</Label><Input placeholder="Engine number" value={newVehicle.engineNo} onChange={(e) => setNewVehicle(prev => ({ ...prev, engineNo: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Chassis Number</Label><Input placeholder="Chassis number" value={newVehicle.chassisNo} onChange={(e) => setNewVehicle(prev => ({ ...prev, chassisNo: e.target.value }))} /></div>
                </div>
              </div>
              <Button onClick={handleAddVehicle} disabled={!newVehicle.regNo || !newVehicle.ownerName || !newVehicle.makerModel} className="w-full gap-2"><Plus className="h-4 w-4" />Add Vehicle</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test History Tab */}
        <TabsContent value="test-history">
          <Card>
            <CardHeader><CardTitle>Test History</CardTitle><CardDescription>All emission tests conducted</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Owner</TableHead><TableHead>CO2 Level</TableHead><TableHead>PM Level</TableHead><TableHead>Test Date</TableHead><TableHead>Expiry Date</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                <TableBody>
                  {emissionTests.map((test) => {
                    const vehicle = vehicles.find((v) => v.id === test.vehicleId)
                    return (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{vehicle?.regNo || "N/A"}</TableCell>
                        <TableCell>{vehicle?.ownerName || "N/A"}</TableCell>
                        <TableCell>{test.co2Level}%</TableCell>
                        <TableCell>{test.pmLevel} mg/m³</TableCell>
                        <TableCell>{test.testDate}</TableCell>
                        <TableCell>{test.expiryDate}</TableCell>
                        <TableCell><Badge className={test.result === "Pass" ? "bg-secondary text-secondary-foreground" : ""} variant={test.result === "Pass" ? "default" : "destructive"}>{test.result}</Badge></TableCell>
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
