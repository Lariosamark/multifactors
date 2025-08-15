'use client';

import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [project, setProject] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      // Project
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) setProject(projectDoc.data());

      // Quotation
      const qSnap = await getDocs(
        query(collection(db, 'quotations'), where('projectId', '==', projectId))
      );
      if (!qSnap.empty) setQuotation(qSnap.docs[0].data());

      // Purchase Order
      const poSnap = await getDocs(
        query(collection(db, 'purchaseOrders'), where('projectId', '==', projectId))
      );
      if (!poSnap.empty) setPurchaseOrder(poSnap.docs[0].data());
    };

    fetchData();
  }, [projectId]);

  useEffect(() => {
    // Get user role from localStorage, sessionStorage, or your auth context
    const role = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const handleDashboardClick = () => {
    if (userRole === 'admin') {
      window.location.href = '/admin/dashboard';
    } else if (userRole === 'Employee') {
      window.location.href = '/employee/dashboard';
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  if (!project || !quotation || !purchaseOrder) {
    return <p className="text-center mt-10">Loading Preview...</p>;
  }

  const LogoHeader = ({ refNo }: { refNo: string }) => (
    <div className="mb-6">
      {/* Logo centered */}
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="Company Logo"
          width={150}
          height={150}
          priority
        />
      </div>

      {/* Reference number below logo, right-aligned */}
      <div className="flex justify-end mt-2">
        <div className="text-right">
          <p className="font-bold">Reference Number:</p>
          <p>{refNo}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col items-center p-4">
      {/* Buttons */}
      <div className="flex gap-3 mb-4 print:hidden">
        <button
          onClick={() => window.history.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <button
          onClick={handleDashboardClick}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          {userRole === 'admin'
            ? '/admin/dashboard'
            : userRole === 'Employee'
            ? '/employee/dashboard'
            : 'Dashboard'}
        </button>

        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print All
        </button>
      </div>

      {/* Forms (Project, Quotation, Purchase Order) */}
      <form>
        <LogoHeader refNo={project.refNo} />
        {/* ... rest of your form content ... */}
      </form>

      <form>
        <LogoHeader refNo={quotation.refNo} />
        {/* ... rest of quotation form ... */}
      </form>

      <form>
        <LogoHeader refNo={purchaseOrder.refNo} />
        {/* ... rest of purchase order form ... */}
      </form>
    </div>
  );
}
