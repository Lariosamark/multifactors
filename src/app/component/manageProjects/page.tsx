'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the path to your Firebase config

export default function NavigationButtons() {
  const buttons = [
    {
      name: 'New Project',
      href: '/component/project',
      description: 'Create and manage new projects',
      icon: '📋'
    },
    {
      name: 'New Quotation',
      href: '/component/QuotationForm',
      description: 'Generate quotes for clients',
      icon: '💰'
    },
    {
      name: 'Project Order',
      href: '/purchase-order',
      description: 'Manage purchase orders',
      icon: '📦'
    }
  ];

  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allData: any[] = [];

        // Fetch Projects
        const projectsQuery = query(
          collection(db, 'projects'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        
        projectsSnapshot.forEach((doc) => {
          const data = doc.data();
          allData.push({
            id: doc.id,
            referenceNumber: data.referenceNumber || data.refNo|| doc.id,
            customerName: data.clientName || data.client || 'N/A',
            projectName: data.projectName || data.title || data.name || 'Untitled Project',
            projectType: 'Project',
            remarks: data.status || data.remarks || 'Active',
            createdAt: data.createdAt
          });
        });

        // Fetch Quotations
        const quotationsQuery = query(
          collection(db, 'quotations'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const quotationsSnapshot = await getDocs(quotationsQuery);
        
        quotationsSnapshot.forEach((doc) => {
          const data = doc.data();
          allData.push({
            id: doc.id,
            referenceNumber: data.quotationNumber || data.refNo || doc.id,
            customerName: data.clientName || data.name || 'N/A',
            projectName: data.subject || data.description || data.title || 'Quotation Request',
            projectType: 'Quotation',
            remarks: data.status || data.remarks || 'Pending',
            createdAt: data.createdAt
          });
        });

        // Fetch Customers (latest projects/orders)
        const customersQuery = query(
          collection(db, 'purchaseOrders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const customersSnapshot = await getDocs(customersQuery);
        
        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          // Only add if they have recent projects/orders
          if (data.lastProject || data.lastOrder) {
            allData.push({
              id: doc.id,
              poNumber: data.customerCode || data.poNumber || doc.id,
              supplier: data.clientName || data.supplier || 'Unknown Customer',
              total: data.lastProject || data.total || 'Customer Record',
              projectType: 'Project Order',
              remarks: data.status || 'Active',
              createdAt: data.createdAt
            });
          }
        });

        // Sort all data by creation date (most recent first)
        allData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });

        // Take only the most recent 15 items
        setTableData(allData.slice(0, 15));
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check your Firebase configuration.');
        // Fallback to sample data
        setTableData([
          {
            id: 'sample-1',
            referenceNumber: 'Loading...',
            customerName: 'Please check Firebase connection',
            projectName: 'Sample Data',
            projectType: 'System',
            remarks: 'Error'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (remarks: string) => {
    switch (remarks.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'under review':
        return 'bg-orange-100 text-orange-800';
      case 'planning phase':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'project':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'quotation':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'project order':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Project Management Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your workflow with our comprehensive project management tools
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {buttons.map((button, index) => (
            <Link
              key={index}
              href={button.href}
              className="group relative overflow-hidden"
            >
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100 h-[140px] flex items-center justify-between">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D5128] via-[#1a3015] to-[#2D5128] opacity-0 group-hover:opacity-95 transition-opacity duration-300 rounded-lg"></div>
                
                {/* Content */}
                <div className="relative z-10 flex items-center w-full">
                  {/* Icon Container */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2D5128] via-[#1a3015] to-[#2D5128] rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/20 transition-all duration-300 flex-shrink-0">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {button.icon}
                    </span>
                  </div>

                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">
                      {button.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 group-hover:text-gray-200 transition-colors duration-300">
                      {button.description}
                    </p>
                  </div>

                  {/* Action Arrow */}
                  <div className="relative z-10 flex items-center text-[#2D5128] group-hover:text-white transition-colors duration-300 ml-4">
                    <svg 
                      className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Projects Table */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#2D5128] to-[#1a3015] px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
                  <p className="text-green-100">Overview of your latest projects, quotations, and orders</p>
                </div>
                {loading && (
                  <div className="flex items-center text-white">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">Reference Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">Customer Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">Project Name/Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">Project Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="text-red-600 mb-2">⚠️ {error}</div>
                        <div className="text-sm text-gray-500">
                          Please ensure your Firebase configuration is correct and the collections exist.
                        </div>
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5128] mr-3"></div>
                          Loading data from Firebase...
                        </div>
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No data found. Create your first project, quotation, or customer record!
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {row.referenceNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {row.customerName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="font-medium">{row.projectName}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(row.projectType)}`}>
                            {row.projectType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(row.remarks)}`}>
                            {row.remarks}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Showing {tableData.length} entries</span>
                <div className="flex items-center space-x-2">
                  <span>Items per page:</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-xs">
                    <option>5</option>
                    <option>10</option>
                    <option>25</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-gray-700 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}