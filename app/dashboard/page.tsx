export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of KYC operations and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg">Total Cases</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg">Pending Review</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg">Completed</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  )
}
