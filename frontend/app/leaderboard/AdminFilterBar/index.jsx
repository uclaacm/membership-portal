'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import FilterDropdown from '@/components/FilterDropdown';
import Config from '@/lib/config';
import './style.scss';

// Values correspond to the `year` integer field in the User model (1-5).
const YEAR_OPTIONS = [
  { value: '1', label: 'Freshman' },
  { value: '2', label: 'Sophomore' },
  { value: '3', label: 'Junior' },
  { value: '4', label: 'Senior' },
  { value: '5', label: 'Post-Senior' },
];
const ROLE_OPTIONS = ['MEMBER', 'OFFICER', 'ADMIN'];

/**
 * Filter bar for the admin/officer leaderboard view.
 * Officers see only the Year dropdown; admins see Committee, Year, and Role.
 * Filter state is stored in URL search params so selections survive page refreshes.
 */
export default function AdminFilterBar({ isAdmin }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedYear = searchParams.getAll('year');
  const selectedRole = searchParams.getAll('role');
  const selectedCommittee = searchParams.getAll('committee');

  const updateParams = useCallback(
    (key, values) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      values.forEach((v) => params.append(key, v));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return (
    <div className="admin-filter-bar">
      <h2 className="admin-filter-bar-title">Members</h2>
      <div className="admin-filter-bar-filters">
        {isAdmin && (
          <FilterDropdown
            label="Committee"
            options={Config.committees}
            selected={selectedCommittee}
            onChange={(vals) => updateParams('committee', vals)}
          />
        )}
        <FilterDropdown
          label="Year"
          options={YEAR_OPTIONS}
          selected={selectedYear}
          onChange={(vals) => updateParams('year', vals)}
        />
        {isAdmin && (
          <FilterDropdown
            label="Role"
            options={ROLE_OPTIONS}
            selected={selectedRole}
            onChange={(vals) => updateParams('role', vals)}
          />
        )}
      </div>
    </div>
  );
}
