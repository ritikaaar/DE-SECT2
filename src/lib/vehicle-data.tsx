import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export interface Vehicle {
  id: string
  regNo: string
  ownerName: string
  ownerMobile: string
  fuelType: "Petrol" | "Diesel" | "CNG" | "EV"
  bsStage: "BS-IV" | "BS-VI"
  regDate: string
  vehicleClass: string
  engineNo: string
  chassisNo: string
  makerModel: string
}

export interface EmissionTest {
  id: string
  vehicleId: string
  stationId: string
  co2Level: number
  pmLevel: number
  testDate: string
  expiryDate: string
  result: "Pass" | "Fail"
  testedBy: string
}

export interface Compliance {
  id: string
  vehicleId: string
  pucExpiryDate: string
  isZteCompliant: boolean
  status: "Compliant" | "Non-Compliant" | "Expired"
}

export interface Penalty {
  id: string
  vehicleId: string
  violationType: string
  fineAmount: number
  paymentStatus: "Pending" | "Paid"
  issuedDate: string
  issuedBy: string
  location?: string
}

interface VehicleDataContextType {
  vehicles: Vehicle[]
  emissionTests: EmissionTest[]
  compliance: Compliance[]
  penalties: Penalty[]
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void
  addEmissionTest: (test: Omit<EmissionTest, "id">) => void
  updateCompliance: (vehicleId: string, compliance: Partial<Compliance>) => void
  addPenalty: (penalty: Omit<Penalty, "id">) => void
  payPenalty: (penaltyId: string) => void
  getVehicleByRegNo: (regNo: string) => Vehicle | undefined
  getVehicleTests: (vehicleId: string) => EmissionTest[]
  getVehicleCompliance: (vehicleId: string) => Compliance | undefined
  getVehiclePenalties: (vehicleId: string) => Penalty[]
}

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    regNo: "DL01AB1234",
    ownerName: "Rajesh Kumar",
    ownerMobile: "9876543210",
    fuelType: "Petrol",
    bsStage: "BS-VI",
    regDate: "2022-05-15",
    vehicleClass: "LMV",
    engineNo: "EN123456789",
    chassisNo: "CH987654321",
    makerModel: "Maruti Swift",
  },
  {
    id: "v2",
    regNo: "DL02CD5678",
    ownerName: "Priya Sharma",
    ownerMobile: "9876543211",
    fuelType: "Diesel",
    bsStage: "BS-IV",
    regDate: "2015-08-20",
    vehicleClass: "LMV",
    engineNo: "EN223456789",
    chassisNo: "CH287654321",
    makerModel: "Toyota Innova",
  },
  {
    id: "v3",
    regNo: "DL03EF9012",
    ownerName: "Amit Singh",
    ownerMobile: "9876543212",
    fuelType: "CNG",
    bsStage: "BS-VI",
    regDate: "2023-01-10",
    vehicleClass: "LMV",
    engineNo: "EN323456789",
    chassisNo: "CH387654321",
    makerModel: "Hyundai Xcent",
  },
]

const INITIAL_TESTS: EmissionTest[] = [
  {
    id: "t1",
    vehicleId: "v1",
    stationId: "s1",
    co2Level: 2.5,
    pmLevel: 45,
    testDate: "2025-12-01",
    expiryDate: "2026-06-01",
    result: "Pass",
    testedBy: "PUC Testing Officer",
  },
  {
    id: "t2",
    vehicleId: "v2",
    stationId: "s1",
    co2Level: 4.8,
    pmLevel: 120,
    testDate: "2025-10-15",
    expiryDate: "2026-04-15",
    result: "Fail",
    testedBy: "PUC Testing Officer",
  },
]

const INITIAL_COMPLIANCE: Compliance[] = [
  {
    id: "c1",
    vehicleId: "v1",
    pucExpiryDate: "2026-06-01",
    isZteCompliant: true,
    status: "Compliant",
  },
  {
    id: "c2",
    vehicleId: "v2",
    pucExpiryDate: "2025-04-15",
    isZteCompliant: false,
    status: "Expired",
  },
  {
    id: "c3",
    vehicleId: "v3",
    pucExpiryDate: "2025-07-10",
    isZteCompliant: true,
    status: "Compliant",
  },
]

const INITIAL_PENALTIES: Penalty[] = [
  {
    id: "p1",
    vehicleId: "v2",
    violationType: "Expired PUC",
    fineAmount: 5000,
    paymentStatus: "Pending",
    issuedDate: "2026-03-10",
    issuedBy: "Traffic Patrol Officer",
    location: "Main Road, Sector 12, Delhi",
  },
]

const VehicleDataContext = createContext<VehicleDataContextType | undefined>(undefined)

export function VehicleDataProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [emissionTests, setEmissionTests] = useState<EmissionTest[]>([])
  const [compliance, setCompliance] = useState<Compliance[]>([])
  const [penalties, setPenalties] = useState<Penalty[]>([])

  useEffect(() => {
    const storedVehicles = localStorage.getItem("desect_vehicles")
    const storedTests = localStorage.getItem("desect_tests")
    const storedCompliance = localStorage.getItem("desect_compliance")
    const storedPenalties = localStorage.getItem("desect_penalties")

    setVehicles(storedVehicles ? JSON.parse(storedVehicles) : INITIAL_VEHICLES)
    setEmissionTests(storedTests ? JSON.parse(storedTests) : INITIAL_TESTS)
    setCompliance(storedCompliance ? JSON.parse(storedCompliance) : INITIAL_COMPLIANCE)
    setPenalties(storedPenalties ? JSON.parse(storedPenalties) : INITIAL_PENALTIES)
  }, [])

  useEffect(() => {
    if (vehicles.length > 0) localStorage.setItem("desect_vehicles", JSON.stringify(vehicles))
  }, [vehicles])

  useEffect(() => {
    if (emissionTests.length > 0) localStorage.setItem("desect_tests", JSON.stringify(emissionTests))
  }, [emissionTests])

  useEffect(() => {
    if (compliance.length > 0) localStorage.setItem("desect_compliance", JSON.stringify(compliance))
  }, [compliance])

  useEffect(() => {
    if (penalties.length > 0) localStorage.setItem("desect_penalties", JSON.stringify(penalties))
  }, [penalties])

  const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
    const newVehicle = { ...vehicle, id: `v${Date.now()}` }
    setVehicles((prev) => [...prev, newVehicle])
  }

  const addEmissionTest = (test: Omit<EmissionTest, "id">) => {
    const newTest = { ...test, id: `t${Date.now()}` }
    setEmissionTests((prev) => [...prev, newTest])
    
    // Auto-update compliance (TRIGGER LOGIC)
    const isPass = test.result === "Pass"
    updateCompliance(test.vehicleId, {
      pucExpiryDate: test.expiryDate,
      status: isPass ? "Compliant" : "Non-Compliant",
    })

    // Auto-issue penalty on fail (mirrors SQL trigger: auto_penalty_on_fail)
    if (!isPass) {
      const newPenalty: Penalty = {
        id: `p${Date.now()}`,
        vehicleId: test.vehicleId,
        violationType: "Failed Emission Test",
        fineAmount: 5000,
        paymentStatus: "Pending",
        issuedDate: test.testDate,
        issuedBy: "System (Auto-Generated)",
        location: "PUC Testing Station",
      }
      setPenalties((prev) => [...prev, newPenalty])
    }
  }

  const updateCompliance = (vehicleId: string, updates: Partial<Compliance>) => {
    setCompliance((prev) => {
      const existing = prev.find((c) => c.vehicleId === vehicleId)
      if (existing) {
        return prev.map((c) => (c.vehicleId === vehicleId ? { ...c, ...updates } : c))
      }
      return [...prev, { id: `c${Date.now()}`, vehicleId, pucExpiryDate: "", isZteCompliant: false, status: "Non-Compliant", ...updates }]
    })
  }

  const addPenalty = (penalty: Omit<Penalty, "id">) => {
    const newPenalty = { ...penalty, id: `p${Date.now()}` }
    setPenalties((prev) => [...prev, newPenalty])
  }

  // PAYMENT INTEGRATION: Update penalty status from 'Pending' to 'Paid'
  const payPenalty = (penaltyId: string) => {
    setPenalties((prev) =>
      prev.map((p) =>
        p.id === penaltyId ? { ...p, paymentStatus: "Paid" as const } : p
      )
    )
  }

  const getVehicleByRegNo = (regNo: string) => {
    return vehicles.find((v) => v.regNo.toLowerCase() === regNo.toLowerCase())
  }

  const getVehicleTests = (vehicleId: string) => {
    return emissionTests.filter((t) => t.vehicleId === vehicleId)
  }

  const getVehicleCompliance = (vehicleId: string) => {
    return compliance.find((c) => c.vehicleId === vehicleId)
  }

  const getVehiclePenalties = (vehicleId: string) => {
    return penalties.filter((p) => p.vehicleId === vehicleId)
  }

  return (
    <VehicleDataContext.Provider
      value={{
        vehicles,
        emissionTests,
        compliance,
        penalties,
        addVehicle,
        addEmissionTest,
        updateCompliance,
        addPenalty,
        payPenalty,
        getVehicleByRegNo,
        getVehicleTests,
        getVehicleCompliance,
        getVehiclePenalties,
      }}
    >
      {children}
    </VehicleDataContext.Provider>
  )
}

export function useVehicleData() {
  const context = useContext(VehicleDataContext)
  if (context === undefined) {
    throw new Error("useVehicleData must be used within a VehicleDataProvider")
  }
  return context
}
