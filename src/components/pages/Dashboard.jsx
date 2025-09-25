import React from "react"
import { motion } from "framer-motion"
import DashboardStats from "@/components/organisms/DashboardStats"
import UpcomingDeadlines from "@/components/organisms/UpcomingDeadlines"
import WeeklySchedule from "@/components/organisms/WeeklySchedule"

const Dashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your academic overview.</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpcomingDeadlines />
        <WeeklySchedule />
      </div>
    </motion.div>
  )
}

export default Dashboard