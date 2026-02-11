"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Building2, Shield, Database, Briefcase } from 'lucide-react';
import { CompaniesHouseTab } from './CompaniesHouseTab';
import { FcaRegisterTab } from './FcaRegisterTab';
import { PlaceholderTab } from './PlaceholderTab';

export function ApiTestingContainer() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          KYC Automation Third Party API Test Harness
        </h2>
        <p className="text-muted-foreground mt-1">
          Test and validate third-party API integrations
        </p>
      </div>

      {/* Tabs */}
      <Card className="shadow-md overflow-hidden">
        <Tabs defaultValue="companies-house" className="w-full">
          <div className="pt-4 px-4 pb-0 bg-muted/30 border-b">
            <TabsList className="w-full flex flex-wrap justify-start gap-2 p-0 bg-transparent h-auto">
              <TabsTrigger
                value="companies-house"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Building2 size={18} />
                Companies House
              </TabsTrigger>
              <TabsTrigger
                value="fca"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Shield size={18} />
                FCA Register
              </TabsTrigger>
              <TabsTrigger
                value="lexisnexis"
                disabled
                className="flex items-center gap-2 opacity-50 cursor-not-allowed"
              >
                <Database size={18} />
                LexisNexis
              </TabsTrigger>
              <TabsTrigger
                value="dnb"
                disabled
                className="flex items-center gap-2 opacity-50 cursor-not-allowed"
              >
                <Briefcase size={18} />
                Dun & Bradstreet
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="companies-house" className="mt-0">
              <CompaniesHouseTab />
            </TabsContent>

            <TabsContent value="fca" className="mt-0">
              <FcaRegisterTab />
            </TabsContent>

            <TabsContent value="lexisnexis" className="mt-0">
              <PlaceholderTab
                name="LexisNexis"
                description="Legal and regulatory data provider integration for enhanced due diligence and risk assessment."
                icon={Database}
              />
            </TabsContent>

            <TabsContent value="dnb" className="mt-0">
              <PlaceholderTab
                name="Dun & Bradstreet"
                description="Business intelligence and credit reporting integration for comprehensive company analysis."
                icon={Briefcase}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
