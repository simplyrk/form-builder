'use client';

import React from 'react';

import Link from 'next/link';

import { useUser } from '@clerk/nextjs';
import { ChevronRight, FileText, ChevronsUpDown, Link2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-10">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Welcome back, {user?.firstName || 'User'}
          </p>
        </div>
        <Link href="/admin/forms/new">
          <Button>Create New Form</Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Using Linked Submissions</h2>
              <Link2 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-4">
              You can now link submissions from one form to another, allowing you to create relationships between your data.
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2 text-gray-800">How to use linked submissions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Create a form that will store the primary data</li>
                <li>Create a second form with a <code className="text-sm bg-gray-200 px-1 py-0.5 rounded">linkedSubmission</code> field type</li>
                <li>Select the primary form as the linked form</li>
                <li>When filling out the second form, you can search and select submissions from the primary form</li>
              </ol>
            </div>
            <Link href="/admin/forms/new">
              <Button className="w-full">
                Try Creating a Form with Linked Submissions
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Use Cases</h2>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              <div className="p-3 border rounded-md">
                <h3 className="font-medium">Customer Orders</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Create a Customers form and an Orders form. Link each order to a customer.
                </p>
              </div>
              <div className="p-3 border rounded-md">
                <h3 className="font-medium">Event Registration</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Create an Events form and a Registration form. Link registrations to specific events.
                </p>
              </div>
              <div className="p-3 border rounded-md">
                <h3 className="font-medium">Project Tasks</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Create a Projects form and a Tasks form. Link tasks to specific projects.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link href="/admin/forms">
                <Button variant="outline" className="w-full justify-between">
                  View All Forms
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/forms/new">
                <Button variant="outline" className="w-full justify-between">
                  Create New Form
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/api/forms/available">
                <Button variant="outline" className="w-full justify-between">
                  Public Forms
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Supported Field Types</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <ChevronsUpDown className="h-4 w-4 mr-2 text-blue-600" />
                Text, Textarea, Email, URL
              </li>
              <li className="flex items-center">
                <ChevronsUpDown className="h-4 w-4 mr-2 text-blue-600" />
                Number, Date, Time
              </li>
              <li className="flex items-center">
                <ChevronsUpDown className="h-4 w-4 mr-2 text-blue-600" />
                Select, Radio, Checkbox
              </li>
              <li className="flex items-center">
                <ChevronsUpDown className="h-4 w-4 mr-2 text-blue-600" />
                File Upload
              </li>
              <li className="flex items-center">
                <ChevronsUpDown className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">Linked Submission</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 