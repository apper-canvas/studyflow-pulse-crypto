import React, { useContext } from 'react'
import Button from '@/components/atoms/Button'
import { AuthContext } from '@/App'

const LogoutButton = ({ className = "" }) => {
  const { logout } = useContext(AuthContext)

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={logout}
      icon="LogOut"
      className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
    >
      Logout
    </Button>
  )
}

export default LogoutButton