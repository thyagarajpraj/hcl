import { useEffect, useState } from "react";
import type { Employee, FeedbackEntry } from "../types";

interface DashboardStats {
  totalEmployees: number;
  totalFeedback: number;
  avgRating: number;
  feedbackByDept: Array<{
    _id: string;
    count: number;
    avgRating: number;
  }>;
  recentFeedback: FeedbackEntry[];
}

interface DepartmentData {
  _id: string;
  employeeCount: number;
  avgRating: number;
  totalFeedback: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");
        const token = localStorage.getItem("auth_token");
        if (!token) throw new Error("Not authenticated");

        // Fetch stats
        const statsRes = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!statsRes.ok) throw new Error("Failed to load stats");
        const statsData = await statsRes.json();
        setStats(statsData.stats);

        // Fetch departments
        const deptRes = await fetch("http://localhost:5000/api/admin/departments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!deptRes.ok) throw new Error("Failed to load departments");
        const deptData = await deptRes.json();
        setDepartments(deptData.departments || []);

        // Fetch employees
        const empRes = await fetch("http://localhost:5000/api/employees", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!empRes.ok) throw new Error("Failed to load employees");
        const empData = await empRes.json();
        setEmployees(empData.employees || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <section className="loading-card">
          <h1>Loading admin dashboard...</h1>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <section className="banner banner-error mt-6">{error}</section>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <p className="eyebrow mb-4">Admin Panel</p>
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="metric-card">
          <span className="metric-label">Total Employees</span>
          <strong>{stats?.totalEmployees || 0}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Feedback</span>
          <strong>{stats?.totalFeedback || 0}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Average Rating</span>
          <strong>{stats?.avgRating || 0}/5</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Active Departments</span>
          <strong>{stats?.feedbackByDept.length || 0}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Department Performance */}
        <section className="panel">
          <p className="section-kicker">Department Analytics</p>
          <h2 className="text-2xl font-bold mb-6">Performance by Department</h2>
          <div className="space-y-4">
            {departments.map(dept => (
              <div
                key={dept._id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{dept._id}</h3>
                  <span className="rating-badge">{dept.avgRating}/5</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>Employees: {dept.employeeCount}</div>
                  <div>Feedback: {dept.totalFeedback}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback by Rating Distribution */}
        <section className="panel">
          <p className="section-kicker">Feedback Distribution</p>
          <h2 className="text-2xl font-bold mb-6">Rating Distribution</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats?.feedbackByDept.reduce((sum, d) => sum + d.totalFeedback, 0) || 0;
              const percentage = count > 0 ? Math.round((count / (stats?.totalFeedback || 1)) * 100) : 0;
              return (
                <div key={rating} className="flex items-center gap-4">
                  <span className="w-12 text-right font-bold">{rating}★</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all"
                      style={{
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-slate-600">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent Feedback */}
      <section className="panel">
        <p className="section-kicker">Recent Activity</p>
        <h2 className="text-2xl font-bold mb-6">Latest Feedback</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {stats?.recentFeedback.slice(0, 10).map((fb, idx) => (
            <div key={idx} className="feedback-item">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <strong>{(fb.givenBy as Employee)?.name || "Unknown"}</strong>
                  <span className="text-slate-600 text-sm"> → {(fb.givenTo as Employee)?.name || "Unknown"}</span>
                </div>
                <span className="rating-badge text-sm">{fb.rating}/5</span>
              </div>
              <p className="text-slate-700 text-sm">{fb.comment}</p>
              <span className="text-xs text-slate-500 mt-2 block">
                {new Date(fb.createdAt || "").toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Employees List */}
      <section className="panel mt-8">
        <p className="section-kicker">Employees</p>
        <h2 className="text-2xl font-bold mb-6">Employee Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left p-3 font-bold">Name</th>
                <th className="text-left p-3 font-bold">Email</th>
                <th className="text-left p-3 font-bold">Department</th>
                <th className="text-left p-3 font-bold">Role</th>
              </tr>
            </thead>
            <tbody>
              {employees.slice(0, 20).map(emp => (
                <tr key={emp._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-3">{emp.name}</td>
                  <td className="p-3 text-sm text-slate-600">{emp.email}</td>
                  <td className="p-3">{emp.department}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                      {emp.role || "employee"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
