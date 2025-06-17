'use client';

import { use } from 'react';
import RequirementDetail from './components/RequirementDetail';
import ForumRequirement from './components/ForumRequirement';
import { getStudentRequirementDetail } from '@/app/_actions/requirement';
import { useEffect, useState } from 'react';

export default function RequirementDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; requirementId: string }> 
}) {
  const resolvedParams = use(params);
  const [requirementType, setRequirementType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirementType = async () => {
      try {
        const response = await getStudentRequirementDetail(resolvedParams.requirementId);
        if (response.success && response.data) {
          setRequirementType(response.data.type);
        }
      } catch (error) {
        console.error('Error fetching requirement type:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchRequirementType();
  }, [resolvedParams.requirementId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  if (requirementType === 'FORUM') {
    return <ForumRequirement id={resolvedParams.id} requirementId={resolvedParams.requirementId} />;
  }

  return <RequirementDetail id={resolvedParams.id} requirementId={resolvedParams.requirementId} />;
} 