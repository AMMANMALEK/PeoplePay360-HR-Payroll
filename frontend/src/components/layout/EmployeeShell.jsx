import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeTopBar from './EmployeeTopBar';
import Toast from '../ui/Toast';
import { EmployeeDataProvider, useEmployeeData } from '../../context/EmployeeDataContext';

function EmployeeShellLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { toast, closeToast } = useEmployeeData();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas font-sans text-slate-900">
      <EmployeeSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <EmployeeTopBar onOpenMobileMenu={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

export default function EmployeeShell() {
  return (
    <EmployeeDataProvider>
      <EmployeeShellLayout />
    </EmployeeDataProvider>
  );
}
